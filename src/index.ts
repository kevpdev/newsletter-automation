/**
 * Newsletter Automation Main Orchestrator
 *
 * Weekly Tech Digest Pipeline:
 * 1. Fetch: Retrieve articles from FreshRSS (last 7 days, all categories)
 * 2. Score: Use AI/LLM to score relevance (1-10 scale) for specific domain
 * 3. Aggregate: Select best articles (5-10 per email) by tier
 * 4. Render: Generate ADHD-friendly HTML with domain colors
 * 5. Send: Deliver to Gmail with proper labels
 *
 * Execution:
 * - Triggered by GitHub Actions weekly schedule (Monday 8am UTC)
 * - Processes one domain per run (currently: Java only)
 * - Logs all operations for debugging + transparency
 *
 * Environment Variables (required):
 * - FRESHRSS_BASE_URL: FreshRSS instance URL
 * - FRESHRSS_TOKEN: FreshRSS API token (Google Reader format)
 * - OPENROUTER_API_KEY: OpenRouter API key for LLM access
 * - GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN: Gmail OAuth
 * - USER_EMAIL: Target email for digests
 */

import dotenv from 'dotenv';
import logger from './logger.js';
import { sendEmail } from './gmail/send.js';
import { fetchArticlesForStream } from './freshrss/client.js';
import { scoreArticles } from './ai/scoring.js';
import { aggregateByScore } from './aggregator.js';
import { renderDigest } from './renderer.js';
import { DOMAINS } from './config.js';
import type { OutputEmail } from './types.js';

dotenv.config();

/**
 * Calculates current week number and year.
 * Used for email subject line and logs.
 *
 * @returns String like "Week 3, 2025"
 */
function getCurrentWeek(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const week = Math.ceil((dayOfYear + 1) / 7);
  return `Week ${week}, ${now.getFullYear()}`;
}

/**
 * Main orchestration function: Coordinates the entire digest pipeline.
 *
 * Pipeline:
 * 1. Fetch articles from FreshRSS (50 articles, last 7 days)
 * 2. Score articles with AI (relevance 1-10)
 * 3. Aggregate best articles (5-10 total, prioritizing high scores)
 * 4. Render ADHD-friendly HTML email
 * 5. Send via Gmail with appropriate labels
 *
 * Error handling:
 * - Logs all errors for observability
 * - Skips digest if insufficient articles or scoring fails
 * - Continues gracefully instead of crashing
 *
 * @throws Error if environment variables missing or API calls fail
 */
async function main() {
  const startTime = Date.now();

  try {
    logger.info('🚀 Starting Tech Digest Batch (FreshRSS + Gemini Flash 2.5)');

    const userEmail = process.env.USER_EMAIL;
    if (!userEmail) {
      throw new Error('USER_EMAIL environment variable not set');
    }

    const javaDomain = DOMAINS[0];
    logger.info(`📁 Domain: ${javaDomain.label}`);

    logger.info('📡 Fetching articles from FreshRSS...');
    const articles = await fetchArticlesForStream(javaDomain.freshrssStreamId);

    if (articles.length === 0) {
      logger.warn('No articles fetched from FreshRSS, skipping digest');
      return;
    }

    logger.info(`✓ Fetched ${articles.length} articles`);

    // Note: Using Gemini Flash 2.5 (faster, cost-effective) instead of Claude Haiku
    logger.info('🤖 Scoring articles with Gemini Flash 2.5...');
    const scoredArticles = await scoreArticles(articles, 'java');

    if (scoredArticles.length === 0) {
      logger.warn('No articles successfully scored, skipping digest');
      return;
    }

    logger.info(`✓ Scored ${scoredArticles.length} articles`);

    const digest = aggregateByScore(scoredArticles);

    logger.info('🎨 Rendering HTML digest...');
    const htmlBody = renderDigest(digest, javaDomain);

    const outputEmail: OutputEmail = {
      to: userEmail,
      subject: `[Java] Tech Digest - ${getCurrentWeek()}`,
      htmlBody,
      outputLabel: javaDomain.outputLabel,
    };

    logger.info('📧 Sending tech digest email...');
    await sendEmail(outputEmail);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(`\n${'='.repeat(60)}`);
    logger.info(`✅ Tech Digest completed in ${duration}s`);
    logger.info(`${'='.repeat(60)}`);
  } catch (error) {
    logger.error(`❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

main();
