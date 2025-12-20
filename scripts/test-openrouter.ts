import dotenv from 'dotenv';
import { summarizeWithAI } from '../src/ai/openrouter.js';
import { buildPrompt } from '../src/ai/prompt.js';
import type { EmailMetadata } from '../src/types.js';

dotenv.config();

async function testOpenRouter() {
  console.log('Testing OpenRouter API integration...\n');

  const testMetadata: EmailMetadata = {
    sender: 'test@javaweekly.com',
    subject: 'Java 21 Virtual Threads - Performance Deep Dive',
    htmlContent: `
      <h1>Virtual Threads in Java 21</h1>
      <p>Java 21 introduces virtual threads as a stable feature. This changes how we think about concurrency.</p>
      <p>Key benefits:</p>
      <ul>
        <li>Lightweight threads - millions can run concurrently</li>
        <li>Simplified code - no need for async/await</li>
        <li>Better resource utilization</li>
      </ul>
      <p>Migration guide: Start by replacing ExecutorService with virtual thread executors.</p>
    `,
    domain: 'java',
  };

  try {
    const prompt = buildPrompt(testMetadata);
    console.log('Prompt built successfully');
    console.log('Prompt length:', prompt.length, 'characters\n');

    console.log('Calling OpenRouter API...');
    const response = await summarizeWithAI(prompt);

    console.log('\n✅ SUCCESS - OpenRouter API Response:');
    console.log('─'.repeat(80));
    console.log(response);
    console.log('─'.repeat(80));

    try {
      const parsed = JSON.parse(response);
      console.log('\n✅ Response is valid JSON');
      console.log('\nParsed structure:');
      console.log('- title:', parsed.title);
      console.log('- impact:', parsed.impact);
      console.log('- keyPoints:', parsed.keyPoints);
      console.log('- action:', parsed.action);

      if (!parsed.title || !parsed.impact || !parsed.keyPoints || !parsed.action) {
        console.error('\n❌ ERROR: Missing required fields in response');
        process.exit(1);
      }

      if (!Array.isArray(parsed.keyPoints) || parsed.keyPoints.length !== 3) {
        console.error('\n❌ ERROR: keyPoints must be an array of exactly 3 items');
        process.exit(1);
      }

      if (parsed.title.length > 50) {
        console.warn('\n⚠️  WARNING: title exceeds 50 characters:', parsed.title.length);
      }

      console.log('\n✅ All validations passed!');
    } catch (parseError) {
      console.error('\n❌ ERROR: Response is not valid JSON');
      console.error(parseError);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

testOpenRouter();
