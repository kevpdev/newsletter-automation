import { summarizeWithAI } from './openrouter.js';
import { buildScoringPrompt } from './scoring-prompts.js';
import logger from '../logger.js';
import type { Article } from '../types.js';

/**
 * AI LLM Model for article scoring
 *
 * Options:
 * - 'google/gemini-2.5-flash' (default): Fast, cost-effective
 * - 'anthropic/claude-4.5-haiku': Alternative (higher cost)
 *
 * Current: Gemini Flash 2.5 for optimal cost/speed balance
 */
const LLM_MODEL = 'google/gemini-2.5-flash';

/**
 * Article with AI-generated score and reasoning
 *
 * Score range: 1-10
 * - 8-10: Critical (must-read)
 * - 6-7: Important (relevant)
 * - 3-5: Bonus (nice-to-have)
 * - 1-2: Filtered out (not relevant)
 */
export interface ScoredArticle extends Article {
  /** Score 1-10: AI's relevance assessment */
  score: number;
  /** Brief explanation of why article scored this value */
  reason: string;
}

/**
 * Internal response structure from LLM scoring
 * @private
 */
interface ScoreResponse {
  score: number;
  reason: string;
}

/**
 * Scores a single article using LLM (Gemini Flash by default).
 *
 * Process:
 * 1. Build scoring prompt with article context + domain requirements
 * 2. Call OpenRouter API with configured LLM model
 * 3. Parse JSON response (score 1-10, reason)
 * 4. Validate score range and reason
 * 5. Return ScoredArticle with score + reason
 *
 * @param article - Article to score (title, summary, url, etc)
 * @param domain - Domain context (Java, Angular, DevOps, etc) for scoring
 * @returns ScoredArticle with score (1-10) and reasoning
 * @throws Error if LLM API fails or response is invalid JSON
 *
 * @example
 * const article = { title: 'React 19 Features', summary: '...', ... };
 * const scored = await scoreArticle(article, 'Frontend');
 * // { ...article, score: 8, reason: 'Covers latest React features' }
 */
export async function scoreArticle(
  article: Article,
  domain: string
): Promise<ScoredArticle> {
  const prompt = buildScoringPrompt(domain, article);

  try {
    const response = await summarizeWithAI(prompt, LLM_MODEL);
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

/**
 * Scores multiple articles in parallel using Promise.allSettled.
 *
 * Features:
 * - Parallel execution: All articles scored concurrently
 * - Fault tolerance: Failed articles don't block others
 * - Logging: Reports successful and failed counts
 *
 * @param articles - Array of articles to score
 * @param domain - Domain context for scoring (applies to all articles)
 * @returns Array of successfully scored articles
 *
 * @example
 * const articles = [{ title: 'Article 1', ... }, { title: 'Article 2', ... }];
 * const scored = await scoreArticles(articles, 'Java');
 * // Returns only successfully scored articles; failures logged separately
 */
export async function scoreArticles(
  articles: Article[],
  domain: string
): Promise<ScoredArticle[]> {
  logger.info(`Scoring ${articles.length} articles for domain: ${domain}`);

  // Parallel execution: Score all articles concurrently
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

/**
 * Parses and validates LLM score response.
 *
 * Handles:
 * - JSON extraction: Removes markdown code blocks (```json ... ```)
 * - Score validation: Must be number 1-10
 * - Reason validation: Must be non-empty string
 * - Rounding: Converts decimal scores to integers
 *
 * @param response - Raw LLM response (may contain markdown formatting)
 * @returns Validated { score, reason } object
 * @throws Error if JSON is invalid, score out of range, or reason missing
 * @private
 */
function parseScoreResponse(response: string): ScoreResponse {
  // Remove markdown code blocks that LLM sometimes adds
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);

    // Validate score is within acceptable range
    if (typeof parsed.score !== 'number' || parsed.score < 1 || parsed.score > 10) {
      throw new Error(`Invalid score: ${parsed.score} (must be 1-10)`);
    }

    // Validate reason is provided
    if (typeof parsed.reason !== 'string' || parsed.reason.length === 0) {
      throw new Error('Missing or empty reason field');
    }

    return {
      score: Math.round(parsed.score), // Round to nearest integer
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
