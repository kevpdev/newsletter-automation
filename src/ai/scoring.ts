import { summarizeWithAI } from './openrouter.js';
import { buildScoringPrompt } from './scoring-prompts.js';
import logger from '../logger.js';
import type { Article } from '../feedly/types.js';

const CLAUDE_HAIKU_MODEL = 'anthropic/claude-3.5-haiku-20241022';

export interface ScoredArticle extends Article {
  score: number;
  reason: string;
}

interface ScoreResponse {
  score: number;
  reason: string;
}

export async function scoreArticle(
  article: Article,
  domain: string
): Promise<ScoredArticle> {
  const prompt = buildScoringPrompt(domain, article);

  try {
    const response = await summarizeWithAI(prompt, CLAUDE_HAIKU_MODEL);
    const scoreData = parseScoreResponse(response);

    logger.info(`Scored article: ${article.title.slice(0, 50)}... → ${scoreData.score}/10`);

    return {
      ...article,
      score: scoreData.score,
      reason: scoreData.reason,
    };
  } catch (error) {
    logger.error(`Failed to score article: ${article.title}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function scoreArticles(
  articles: Article[],
  domain: string
): Promise<ScoredArticle[]> {
  logger.info(`Scoring ${articles.length} articles for domain: ${domain}`);

  const results = await Promise.allSettled(
    articles.map((article) => scoreArticle(article, domain))
  );

  const scored = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => (result as PromiseFulfilledResult<ScoredArticle>).value);

  const failed = results.filter((result) => result.status === 'rejected').length;

  logger.info(`Scoring complete: ${scored.length} succeeded, ${failed} failed`);

  return scored;
}

function parseScoreResponse(response: string): ScoreResponse {
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);

    if (typeof parsed.score !== 'number' || parsed.score < 1 || parsed.score > 10) {
      throw new Error(`Invalid score: ${parsed.score} (must be 1-10)`);
    }

    if (typeof parsed.reason !== 'string' || parsed.reason.length === 0) {
      throw new Error('Missing or empty reason field');
    }

    return {
      score: Math.round(parsed.score),
      reason: parsed.reason,
    };
  } catch (error) {
    logger.error('Failed to parse score response', {
      response: cleaned.slice(0, 200),
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error(`Score parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
