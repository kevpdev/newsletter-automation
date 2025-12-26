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
 * Processes digest pipeline for a single domain.
 *
 * Pipeline for one domain:
 * 1. Fetch articles from FreshRSS (50 articles, last 7 days)
 * 2. Score articles with AI (relevance 1-10)
 * 3. Aggregate best articles (5-10 total, prioritizing high scores)
 * 4. Render ADHD-friendly HTML email
 * 5. Send via Gmail with appropriate labels
 *
 * @param domain - Domain configuration (label, colors, stream ID, etc)
 * @param userEmail - Target email address
 * @returns true if digest was sent successfully, false if skipped or failed
 */
async function processDomain(
  domain: typeof DOMAINS[0],
  userEmail: string
): Promise<boolean> {
  try {
    logger.info(`📁 Processing domain: ${domain.label}`);

    logger.info('📡 Fetching articles from FreshRSS...');
    const articles = await fetchArticlesForStream(domain.freshrssStreamId);

    if (articles.length === 0) {
      logger.warn(`⊘ No articles fetched for ${domain.label}, skipping digest`);
      return false;
    }

    logger.info(`✓ Fetched ${articles.length} articles`);

    // Note: Using Gemini Flash 2.5 (faster, cost-effective)
    logger.info('🤖 Scoring articles with Gemini Flash 2.5...');
    const scoredArticles = await scoreArticles(articles, domain.label.toLowerCase());

    if (scoredArticles.length === 0) {
      logger.warn(`⊘ No articles scored for ${domain.label}, skipping digest`);
      return false;
    }

    logger.info(`✓ Scored ${scoredArticles.length} articles`);

    const digest = aggregateByScore(scoredArticles);

    logger.info('🎨 Rendering HTML digest...');
    const htmlBody = renderDigest(digest, domain);

    const outputEmail: OutputEmail = {
      to: userEmail,
      subject: `[${domain.label}] Tech Digest - ${getCurrentWeek()}`,
      htmlBody,
      outputLabel: domain.outputLabel,
    };

    logger.info('📧 Sending tech digest email...');
    await sendEmail(outputEmail);

    logger.info(`✅ ${domain.label} digest sent successfully\n`);
    return true;
  } catch (error) {
    logger.error(`❌ Error processing ${domain.label}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Main orchestration function: Processes all domains sequentially.
 *
 * Workflow:
 * 1. Validate environment (USER_EMAIL required)
 * 2. Iterate through all configured domains
 * 3. Process each domain independently (failures don't block others)
 * 4. Report summary at end
 *
 * Error handling:
 * - Graceful degradation: One domain failure doesn't stop others
 * - Logs all errors for observability
 * - Exits with code 1 only if USER_EMAIL is missing (critical)
 */
async function main() {
  const startTime = Date.now();

  try {
    logger.info('🚀 Starting Tech Digest Batch (FreshRSS + Gemini Flash 2.5)');
    logger.info(`📊 Processing ${DOMAINS.length} domains: ${DOMAINS.map(d => d.label).join(', ')}\n`);

    const userEmail = process.env.USER_EMAIL;
    if (!userEmail) {
      throw new Error('USER_EMAIL environment variable not set');
    }

    // Process each domain sequentially
    let successCount = 0;
    for (const domain of DOMAINS) {
      const success = await processDomain(domain, userEmail);
      if (success) successCount++;
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(`${'='.repeat(60)}`);
    logger.info(`✅ Batch completed: ${successCount}/${DOMAINS.length} digests sent in ${duration}s`);
    logger.info(`${'='.repeat(60)}`);

    // Exit with status 1 if no domains succeeded
    if (successCount === 0) {
      process.exit(1);
    }
  } catch (error) {
    logger.error(`❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

main();
