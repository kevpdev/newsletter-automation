import axios, { AxiosError } from 'axios';
import logger from '../logger.js';
import type { FeedlyResponse, FeedlyArticle, Article } from './types.js';

const FEEDLY_API_URL = 'https://cloud.feedly.com/v3/streams/contents';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export async function fetchFeedlyArticles(
  collectionId: string,
  count: number = 20
): Promise<Article[]> {
  const apiKey = process.env.FEEDLY_API_TOKEN;
  if (!apiKey) {
    throw new Error('FEEDLY_API_TOKEN environment variable not set');
  }

  let lastError: Error | null = null;
  const startTime = Date.now();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      logger.info(`Feedly API call attempt ${attempt + 1}/${MAX_RETRIES}`);

      const response = await axios.get<FeedlyResponse>(FEEDLY_API_URL, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        params: {
          streamId: collectionId,
          count,
          ranked: 'newest',
        },
        timeout: 15000,
      });

      const articles = response.data.items.map(normalizeArticle);
      const duration = Date.now() - startTime;

      logger.info(`Fetched ${articles.length} articles from Feedly`, {
        duration_ms: duration,
        attempt: attempt + 1,
      });

      return articles;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.response?.status === 429) {
          const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
          logger.warn(
            `Feedly rate limit hit (429), retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`,
            { duration_ms: duration }
          );

          if (attempt < MAX_RETRIES - 1) {
            await sleep(delayMs);
            lastError = new Error('Feedly rate limit exceeded');
            continue;
          }
        }

        const errorMessage = axiosError.message;
        logger.error('Feedly API call failed', {
          duration_ms: duration,
          status: axiosError.response?.status,
          error: errorMessage,
          attempt: attempt + 1,
        });

        lastError = new Error(`Feedly API error: ${errorMessage}`);
      } else {
        logger.error('Unexpected error during Feedly API call', {
          duration_ms: duration,
          error: error instanceof Error ? error.message : String(error),
          attempt: attempt + 1,
        });

        lastError = error instanceof Error ? error : new Error(String(error));
      }

      if (attempt === MAX_RETRIES - 1) {
        break;
      }
    }
  }

  throw lastError || new Error('Feedly API call failed after all retries');
}

function normalizeArticle(feedlyArticle: FeedlyArticle): Article {
  const url = feedlyArticle.originId || feedlyArticle.alternate?.[0]?.href || '';
  let source: string | undefined;

  if (url) {
    try {
      source = new URL(url).hostname;
    } catch {
      source = undefined;
    }
  }

  return {
    id: feedlyArticle.id,
    title: feedlyArticle.title || 'Untitled',
    summary: feedlyArticle.summary?.content || '',
    url,
    publishedAt: new Date(feedlyArticle.published),
    source,
  };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
