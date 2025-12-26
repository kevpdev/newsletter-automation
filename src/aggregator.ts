import logger from './logger.js';
import type { ScoredArticle } from './ai/scoring.js';

/**
 * Email digest structure after score-based aggregation.
 * Articles are categorized into 3 tiers based on their AI score (0-10).
 */
export interface Digest {
  /** Critical articles (score ≥8): Must-read content */
  critical: ScoredArticle[];
  /** Important articles (6≤score<8): Relevant but not urgent */
  important: ScoredArticle[];
  /** Bonus articles (3≤score<6): Nice-to-have content */
  bonus: ScoredArticle[];
  /** Total number of articles analyzed (before filtering) */
  total: number;
}

/**
 * Configurable limits for article aggregation.
 * - min: Minimum articles to include in digest (using all available if < min)
 * - max: Maximum articles per email (to prevent overwhelming content)
 */
const DIGEST_LIMITS = {
  min: 5,  // Minimum articles per email
  max: 10, // Maximum articles per email
};

/**
 * Aggregates scored articles into a 3-tier digest structure.
 *
 * Strategy:
 * 1. Include ALL critical articles (≥8 score)
 * 2. Include ALL important articles (6-7 score)
 * 3. Fill remaining slots (up to MAX 10) with bonus articles (3-5 score), top scores first
 * 4. Articles with score <3 are filtered out entirely
 *
 * @param scoredArticles - Array of articles with AI-generated scores (0-10)
 * @returns Digest object with categorized articles, respecting min/max limits
 *
 * @example
 * // Input: 2 critical, 1 important, 8 bonus articles
 * // Output: 2 critical + 1 important + 7 bonus = 10 total (fills to MAX)
 */
export function aggregateByScore(scoredArticles: ScoredArticle[]): Digest {
  // Step 1: Get all critical articles (≥8), sorted by score descending
  const critical = scoredArticles
    .filter((a) => a.score >= 8)
    .sort((a, b) => b.score - a.score);

  // Step 2: Get all important articles (≥6, <8), sorted by score descending
  const important = scoredArticles
    .filter((a) => a.score >= 6 && a.score < 8)
    .sort((a, b) => b.score - a.score);

  // Step 3: Calculate how many bonus articles to fill up to maximum
  const currentCount = critical.length + important.length;
  const bonusNeeded = Math.max(0, DIGEST_LIMITS.max - currentCount);

  // Step 4: Get top N bonus articles (≥3, <6) to fill remaining slots
  let bonus = scoredArticles
    .filter((a) => a.score >= 3 && a.score < 6)
    .sort((a, b) => b.score - a.score)
    .slice(0, bonusNeeded);

  // Step 5: Enforce maximum cap by trimming from the end (lowest priority)
  const allArticles = [...critical, ...important, ...bonus];
  if (allArticles.length > DIGEST_LIMITS.max) {
    // Strategy: Keep all critical/important, trim bonus
    const criticalAndImportant = [...critical, ...important];
    bonus = bonus.slice(0, DIGEST_LIMITS.max - criticalAndImportant.length);
  }

  const digestSize = critical.length + important.length + bonus.length;

  logger.info(
    `📊 Digest breakdown: ${critical.length} critical, ` +
    `${important.length} important, ${bonus.length} bonus ` +
    `(total: ${digestSize}/${scoredArticles.length}, min: ${DIGEST_LIMITS.min}, max: ${DIGEST_LIMITS.max})`
  );

  return {
    critical,
    important,
    bonus,
    total: scoredArticles.length,
  };
}
