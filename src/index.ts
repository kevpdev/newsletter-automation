import dotenv from 'dotenv';
import logger from './logger.js';
import { sendEmail } from './gmail/send.js';
import { fetchFeedlyArticles } from './feedly/client.js';
import { scoreArticles } from './ai/scoring.js';
import { aggregateByScore } from './aggregator.js';
import { renderDigest } from './renderer.js';
import { DOMAINS } from './config.js';
import type { OutputEmail } from './types.js';

dotenv.config();

function getCurrentWeek(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const week = Math.ceil((dayOfYear + 1) / 7);
  return `Week ${week}, ${now.getFullYear()}`;
}

async function main() {
  const startTime = Date.now();

  try {
    logger.info('🚀 Starting Java Tech Digest (Feedly + AI Scoring)');

    const userEmail = process.env.USER_EMAIL;
    if (!userEmail) {
      throw new Error('USER_EMAIL environment variable not set');
    }

    const javaDomain = DOMAINS[0];
    logger.info(`📁 Domain: ${javaDomain.label}`);

    logger.info('📡 Fetching articles from Feedly...');
    const articles = await fetchFeedlyArticles(javaDomain.feedlyCollectionId, 20);

    if (articles.length === 0) {
      logger.warn('No articles fetched from Feedly, skipping digest');
      return;
    }

    logger.info(`✓ Fetched ${articles.length} articles`);

    logger.info('🤖 Scoring articles with Claude Haiku...');
    const scoredArticles = await scoreArticles(articles, 'java');

    if (scoredArticles.length === 0) {
      logger.warn('No articles successfully scored, skipping digest');
      return;
    }

    logger.info(`✓ Scored ${scoredArticles.length} articles`);

    const digest = aggregateByScore(scoredArticles);
    logger.info(`📊 Digest breakdown: ${digest.critical.length} critical, ${digest.important.length} important, ${digest.bonus.length} bonus`);

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
    logger.info(`✅ Java Tech Digest completed in ${duration}s`);
    logger.info(`${'='.repeat(60)}`);
  } catch (error) {
    logger.error(`❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

main();
