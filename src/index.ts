import dotenv from 'dotenv';
import logger from './logger.js';
import { sendEmail } from './gmail/send.js';
import { searchWithPerplexity } from './ai/openrouter.js';
import { DOMAIN_PROMPTS } from './ai/domain-prompts.js';
import { parseMarkdownToStructure } from './markdown-converter.js';
import { renderHTML } from './renderer.js';
import { DOMAINS } from './config.js';
import type { OutputEmail } from './types.js';

dotenv.config();

/**
 * Gets current week number for email subject.
 * @returns Week string (e.g., "Week 12, 2025")
 */
function getCurrentWeek(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const week = Math.ceil((dayOfYear + 1) / 7);
  return `Week ${week}, ${now.getFullYear()}`;
}

/**
 * Main: Java tech watch via Perplexity Sonar.
 * Proactive approach: search → parse → render → send.
 */
async function main() {
  const startTime = Date.now();

  try {
    logger.info('🚀 Starting Java Tech Watch (Proactive mode)');

    const userEmail = process.env.USER_EMAIL;
    if (!userEmail) {
      throw new Error('USER_EMAIL environment variable not set');
    }

    // Get Java domain config
    const javaDomain = DOMAINS[0];
    logger.info(`📁 Domain: ${javaDomain.label}`);

    // Step 1: Get Java search prompt
    const javaPrompt = DOMAIN_PROMPTS['java'];
    if (!javaPrompt) {
      throw new Error('Java prompt not found in DOMAIN_PROMPTS');
    }

    // Step 2: Search with Perplexity Sonar via OpenRouter
    logger.info('🔍 Searching with Perplexity Sonar...');
    const markdownResponse = await searchWithPerplexity(javaPrompt);

    // Step 3: Parse Markdown response
    logger.info('📝 Parsing Markdown response...');
    const parsed = parseMarkdownToStructure(markdownResponse);
    logger.info(`✓ Parsed ${parsed.sections.length} sections`);

    // Step 4: Render HTML
    const htmlBody = renderHTML(parsed, javaDomain);

    // Step 5: Construct OutputEmail
    const outputEmail: OutputEmail = {
      to: userEmail,
      subject: `[Java] Tech Watch - ${getCurrentWeek()}`,
      htmlBody,
      outputLabel: javaDomain.outputLabel,
    };

    // Step 6: Send email
    logger.info('📧 Sending tech watch email...');
    await sendEmail(outputEmail);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(`\n${'='.repeat(60)}`);
    logger.info(`✅ Java Tech Watch completed in ${duration}s`);
    logger.info(`${'='.repeat(60)}`);
  } catch (error) {
    logger.error(`❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

main();
