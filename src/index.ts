import dotenv from 'dotenv';
import logger from './logger.js';
import { fetchEmailsByLabel } from './gmail/fetch.js';
import { extractMetadata } from './gmail/extract.js';
import { sendProcessedEmail } from './gmail/send.js';
import { buildPrompt } from './ai/prompt.js';
import { summarizeWithAI } from './ai/openrouter.js';
import { parseAIResponse } from './ai/parser.js';
import { renderHTML } from './renderer.js';
import { DOMAINS } from './config.js';
import type { DomainConfig, OutputEmail } from './types.js';

dotenv.config();

/**
 * Process a single email: extract → AI summarize → render → send.
 * Returns true if successful, false if failed (but doesn't throw).
 */
async function processEmail(
  emailId: string,
  emailContent: unknown,
  domain: DomainConfig
): Promise<boolean> {
  try {
    logger.info(`📧 Processing email ${emailId} (${domain.label})`);

    // Step 1: Extract metadata
    const metadata = extractMetadata({ id: emailId, labelName: domain.label, rawContent: emailContent }, domain.label.toLowerCase());

    // Step 2: Build prompt
    const prompt = buildPrompt(metadata);

    // Step 3: Call AI
    logger.info('🤖 Calling OpenRouter API...');
    const aiResponse = await summarizeWithAI(prompt);

    // Step 4: Parse AI response
    const summary = parseAIResponse(aiResponse);
    logger.info(`✓ AI summary generated: "${summary.title}"`);

    // Step 5: Render HTML
    const htmlBody = renderHTML(summary, domain);

    // Step 6: Construct OutputEmail
    const userEmail = process.env.USER_EMAIL;
    if (!userEmail) {
      throw new Error('USER_EMAIL environment variable not set');
    }

    const outputEmail: OutputEmail = {
      to: userEmail,
      subject: `[${domain.label}] ${summary.title}`,
      htmlBody,
      outputLabel: domain.outputLabel,
    };

    // Step 7: Send email and mark as processed
    await sendProcessedEmail(outputEmail, emailId);
    logger.info(`✅ Email ${emailId} processed successfully\n`);

    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to process email ${emailId}: ${errorMsg}`);
    return false;
  }
}

/**
 * Process all emails for a single domain.
 */
async function processDomain(domain: DomainConfig): Promise<void> {
  logger.info(`\n${'='.repeat(60)}`);
  logger.info(`📁 Processing domain: ${domain.label}`);
  logger.info(`${'='.repeat(60)}\n`);

  try {
    // Fetch emails for this domain
    const emails = await fetchEmailsByLabel(domain.label);

    if (emails.length === 0) {
      logger.info(`No emails found in ${domain.inputLabel}`);
      return;
    }

    logger.info(`Found ${emails.length} email(s) in ${domain.inputLabel}\n`);

    // Process each email
    let successCount = 0;
    let failCount = 0;

    for (const email of emails) {
      const success = await processEmail(email.id, email.rawContent, domain);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    // Summary for this domain
    logger.info(`\n${domain.label} Summary: ${successCount} succeeded, ${failCount} failed`);
  } catch (error) {
    logger.error(`Error processing domain ${domain.label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Main batch processor: process all domains.
 */
async function main() {
  const startTime = Date.now();

  try {
    logger.info('🚀 Starting newsletter automation batch processor');
    logger.info(`Processing ${DOMAINS.length} domains: ${DOMAINS.map(d => d.label).join(', ')}\n`);

    // Process each domain
    for (const domain of DOMAINS) {
      await processDomain(domain);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(`\n${'='.repeat(60)}`);
    logger.info(`✅ Batch processing completed in ${duration}s`);
    logger.info(`${'='.repeat(60)}`);
  } catch (error) {
    logger.error(`❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

main();
