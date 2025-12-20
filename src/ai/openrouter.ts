import axios, { AxiosError } from 'axios';
import logger from '../logger.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3.3-70b-instruct:free';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/** OpenRouter API request format */
interface OpenRouterRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
}

/** OpenRouter API response format with token usage */
interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/** OpenRouter API error response format */
interface OpenRouterError {
  error: {
    message: string;
    code?: number;
  };
}

/**
 * Checks if an Axios error is a 429 rate limit error.
 * @param error - The Axios error to check
 * @returns true if error status is 429 (Too Many Requests)
 */
function isRateLimitError(error: AxiosError): boolean {
  return error.response?.status === 429;
}

/**
 * Type guard to check if data is an OpenRouter error object.
 * @param data - Unknown data to validate
 * @returns true if data matches OpenRouterError structure
 */
function isOpenRouterError(data: unknown): data is OpenRouterError {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as OpenRouterError).error === 'object'
  );
}

/**
 * Async sleep utility for retry delays.
 * @param ms - Milliseconds to sleep
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls OpenRouter API with Llama 3.3 model and exponential backoff retry.
 *
 * Features:
 * - Exponential backoff (1s → 2s → 4s) for 429 rate limit errors
 * - Max 3 retries before failing
 * - 30-second request timeout
 * - Metadata-only logging (no full responses logged)
 *
 * @param prompt - Full prompt including system instructions and user content
 * @returns Raw API response text (JSON string to be parsed)
 * @throws Error if API key missing, all retries exhausted, or response malformed
 *
 * @example
 * const prompt = buildPrompt(metadata);
 * const jsonResponse = await summarizeWithAI(prompt);
 * const summary = JSON.parse(jsonResponse);
 */
export async function summarizeWithAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  // Format request for OpenRouter API
  const requestBody: OpenRouterRequest = {
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
  };

  let lastError: Error | null = null;
  const startTime = Date.now();

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      logger.info(
        `OpenRouter API call attempt ${attempt + 1}/${MAX_RETRIES} (model: ${MODEL})`
      );

      // POST request to OpenRouter with auth headers and timeout
      const response = await axios.post<OpenRouterResponse>(
        OPENROUTER_API_URL,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/newsletter-automation',
            'X-Title': 'Newsletter Automation',
          },
          timeout: 30000,
        }
      );

      const duration = Date.now() - startTime;
      const content = response.data.choices[0]?.message?.content;

      // Validate response contains content
      if (!content) {
        throw new Error('OpenRouter response missing content');
      }

      // Log success with metadata (tokens, duration, not content)
      logger.info('OpenRouter API call successful', {
        duration_ms: duration,
        prompt_tokens: response.data.usage?.prompt_tokens,
        completion_tokens: response.data.usage?.completion_tokens,
        total_tokens: response.data.usage?.total_tokens,
        attempt: attempt + 1,
      });

      return content;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        // Handle 429 rate limit: exponential backoff and retry
        if (isRateLimitError(axiosError)) {
          const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
          logger.warn(
            `Rate limit hit (429), retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`,
            { duration_ms: duration }
          );

          // Retry if not last attempt
          if (attempt < MAX_RETRIES - 1) {
            await sleep(delayMs);
            lastError = new Error('Rate limit exceeded');
            continue; // Go to next attempt
          }
        }

        // Handle other API errors
        const errorData = axiosError.response?.data;
        const errorMessage = isOpenRouterError(errorData)
          ? errorData.error.message
          : axiosError.message;

        logger.error('OpenRouter API call failed', {
          duration_ms: duration,
          status: axiosError.response?.status,
          error: errorMessage,
          attempt: attempt + 1,
        });

        lastError = new Error(`OpenRouter API error: ${errorMessage}`);
      } else {
        // Handle non-Axios errors
        logger.error('Unexpected error during OpenRouter API call', {
          duration_ms: duration,
          error: error instanceof Error ? error.message : String(error),
          attempt: attempt + 1,
        });

        lastError = error instanceof Error ? error : new Error(String(error));
      }

      // Exit loop on last attempt
      if (attempt === MAX_RETRIES - 1) {
        break;
      }
    }
  }

  throw lastError || new Error('OpenRouter API call failed after all retries');
}
