import dotenv from 'dotenv';
import logger from './logger.js';
import { fetchEmailsByLabel } from './gmail/fetch.js';
import { extractMetadata } from './gmail/extract.js';

dotenv.config();

async function main() {
  try {
    logger.info('🚀 Starting newsletter automation - Test Mode');
    logger.info('Domain: Java');

    const emails = await fetchEmailsByLabel('Java');

    if (emails.length === 0) {
      logger.info('✓ No emails found in Input/Java label');
      return;
    }

    logger.info(`✓ Found ${emails.length} email(s) in Input/Java`);

    for (const email of emails) {
      logger.info(`\n📧 Processing email: ${email.id}`);

      const metadata = extractMetadata(email, 'java');

      console.log('\n--- Email Metadata ---');
      console.log(`From: ${metadata.sender}`);
      console.log(`Subject: ${metadata.subject}`);
      console.log(`Domain: ${metadata.domain}`);
      console.log(
        `Content preview: ${metadata.htmlContent.substring(0, 200)}...`
      );
      console.log('--- End Metadata ---\n');
    }

    logger.info('✅ Test completed successfully');
  } catch (error) {
    logger.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

main();
