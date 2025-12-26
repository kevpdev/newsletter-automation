import axios, { AxiosError } from 'axios';
import logger from '../logger.js';
import type { FreshRSSResponse, FreshRSSItem, Article } from './types.js';

// FreshRSS API Configuration
const FRESHRSS_BASE_URL = process.env.FRESHRSS_BASE_URL || '';
const FRESHRSS_TOKEN = process.env.FRESHRSS_TOKEN || '';

// Retry strategy for handling API rate limits
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000; // Exponential backoff: 1s, 2s, 4s

/**
 * Fetches articles from FreshRSS for a specific stream (feed/category).
 *
 * Features:
 * - Google Reader API compatible (via FreshRSS)
 * - Fetches up to N articles from the stream
 * - Filters articles by publication date (client-side)
 * - Implements exponential backoff for rate limit handling (429)
 * - Normalizes FreshRSS items to standard Article format
 *
 * Time-based filtering:
 * - For weekly runs: daysBack=7 (gets articles from last 7 days)
 * - For monthly runs: daysBack=30 (gets articles from last 30 days)
 *
 * @param streamId - FreshRSS stream ID (e.g., "user/-/label/Java")
 * @param count - Maximum articles to fetch from API (default: 50)
 * @param daysBack - Only return articles published in last N days (default: 7)
 * @returns Array of Article objects from the stream, filtered by date
 * @throws Error if FRESHRSS_BASE_URL or FRESHRSS_TOKEN environment variables are missing
 * @throws Error after MAX_RETRIES failed attempts
 *
 * @example
 * // Fetch articles from Java category (last 7 days)
 * const articles = await fetchArticlesForStream('user/-/label/Java');
 * // Returns ~50 articles, filtered to only those from last 7 days
 */
export async function fetchArticlesForStream(
  streamId: string,
  count: number = 50,
  daysBack: number = 7
): Promise<Article[]> {
  // Validate environment configuration
  if (!FRESHRSS_BASE_URL) {
    throw new Error('FRESHRSS_BASE_URL environment variable not set');
  }
  if (!FRESHRSS_TOKEN) {
    throw new Error('FRESHRSS_TOKEN environment variable not set');
  }

  const apiEndpoint = `${FRESHRSS_BASE_URL}/api/greader.php/reader/api/0/stream/contents/${encodeURIComponent(streamId)}`;
  let lastError: Error | null = null;
  const startTime = Date.now();

  // Calculate cutoff date for filtering articles
  const cutoffDate = new Date(Date.now() - (daysBack * 24 * 60 * 60 * 1000));

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      logger.info(`FreshRSS API call attempt ${attempt + 1}/${MAX_RETRIES}`, {
        stream: streamId,
        daysBack,
      });

      const response = await axios.get<FreshRSSResponse>(apiEndpoint, {
        headers: {
          Authorization: `GoogleLogin auth=${FRESHRSS_TOKEN}`,
        },
        params: {
          n: count,
        },
        timeout: 15000,
      });

      // Filter articles by publication date (client-side)
      const allArticles = response.data.items.map(normalizeArticle);
      const articles = allArticles.filter(article => article.publishedAt >= cutoffDate);
      const duration = Date.now() - startTime;

      logger.info(`Fetched ${articles.length}/${allArticles.length} articles from FreshRSS (filtered by ${daysBack} days)`, {
        duration_ms: duration,
        stream: streamId,
        attempt: attempt + 1,
        cutoffDate: cutoffDate.toISOString(),
      });

      return articles;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.response?.status === 429) {
          const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
          logger.warn(
            `FreshRSS rate limit hit (429), retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`,
            { duration_ms: duration }
          );

          if (attempt < MAX_RETRIES - 1) {
            await sleep(delayMs);
            lastError = new Error('FreshRSS rate limit exceeded');
            continue;
          }
        }

        const errorMessage = axiosError.message;
        logger.error('FreshRSS API call failed', {
          duration_ms: duration,
          status: axiosError.response?.status,
          error: errorMessage,
          attempt: attempt + 1,
        });

        lastError = new Error(`FreshRSS API error: ${errorMessage}`);
      } else {
        logger.error('Unexpected error during FreshRSS API call', {
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

  throw lastError || new Error('FreshRSS API call failed after all retries');
}

/**
 * Converts FreshRSS item format to standardized Article format.
 *
 * Handles:
 * - Title extraction (defaults to "Untitled" if missing)
 * - URL extraction (canonical > alternate > fallback)
 * - Source attribution (from feed title or domain)
 * - Timestamp conversion (Unix seconds → JavaScript Date)
 * - Content extraction (summary/content field)
 *
 * @param item - Raw FreshRSS API item response
 * @returns Normalized Article object ready for scoring
 * @private
 */
function normalizeArticle(item: FreshRSSItem): Article {
  const url = extractUrl(item);
  let source: string | undefined;

  // Prefer feed title, fallback to domain from URL
  if (item.origin?.title) {
    source = item.origin.title;
  } else if (url) {
    try {
      source = new URL(url).hostname;
    } catch {
      source = undefined;
    }
  }

  return {
    id: item.id,
    title: item.title || 'Untitled',
    summary: item.summary?.content || '',
    url,
    publishedAt: new Date(item.published * 1000), // Convert Unix seconds to Date
    source,
  };
}

/**
 * Extracts article URL from FreshRSS item links.
 *
 * Priority order:
 * 1. Canonical link (preferred, official URL)
 * 2. Alternate link (fallback)
 * 3. Fallback: `#article-{id}` (article not properly linked)
 *
 * @param item - FreshRSS API item with link data
 * @returns Article URL string
 * @private
 */
function extractUrl(item: FreshRSSItem): string {
  if (item.canonical?.length) {
    return item.canonical[0].href;
  }
  if (item.alternate?.length) {
    return item.alternate[0].href;
  }
  // Fallback for articles without proper links
  return `#article-${item.id}`;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
