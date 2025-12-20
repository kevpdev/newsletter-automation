import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { summarizeWithAI } from '../../src/ai/openrouter.js';

vi.mock('axios');
vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('summarizeWithAI', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.OPENROUTER_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should successfully call OpenRouter API and return content', async () => {
    const mockResponse = {
      data: {
        choices: [
          {
            message: {
              content: '{"title":"Test","impact":"Test impact","keyPoints":["A","B","C"],"action":"Test"}',
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      },
    };

    vi.mocked(axios.post).mockResolvedValue(mockResponse);

    const result = await summarizeWithAI('Test prompt');

    expect(result).toBe('{"title":"Test","impact":"Test impact","keyPoints":["A","B","C"],"action":"Test"}');
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.3-70b-instruct-free',
        messages: [{ role: 'user', content: 'Test prompt' }],
      },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json',
        }),
        timeout: 30000,
      })
    );
  });

  it('should throw error when OPENROUTER_API_KEY is not set', async () => {
    delete process.env.OPENROUTER_API_KEY;

    await expect(summarizeWithAI('Test prompt')).rejects.toThrow(
      'OPENROUTER_API_KEY environment variable is not set'
    );

    expect(axios.post).not.toHaveBeenCalled();
  });

  it('should throw error when response is missing content', async () => {
    const mockResponse = {
      data: {
        choices: [],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      },
    };

    vi.mocked(axios.post).mockResolvedValue(mockResponse);

    await expect(summarizeWithAI('Test prompt')).rejects.toThrow(
      'OpenRouter response missing content'
    );
  });

  it('should retry on 429 rate limit with exponential backoff', async () => {
    const rateLimitError = {
      response: {
        status: 429,
        data: {
          error: {
            message: 'Rate limit exceeded',
          },
        },
      },
      isAxiosError: true,
      message: 'Request failed with status code 429',
    };

    const successResponse = {
      data: {
        choices: [
          {
            message: {
              content: '{"title":"Success after retry"}',
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      },
    };

    vi.mocked(axios.post)
      .mockRejectedValueOnce(rateLimitError)
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce(successResponse);

    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    const result = await summarizeWithAI('Test prompt');

    expect(result).toBe('{"title":"Success after retry"}');
    expect(axios.post).toHaveBeenCalledTimes(3);
  });

  it('should fail after max retries on 429 rate limit', async () => {
    const rateLimitError = {
      response: {
        status: 429,
        data: {
          error: {
            message: 'Rate limit exceeded',
          },
        },
      },
      isAxiosError: true,
      message: 'Request failed with status code 429',
    };

    vi.mocked(axios.post).mockRejectedValue(rateLimitError);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    await expect(summarizeWithAI('Test prompt')).rejects.toThrow('Rate limit exceeded');
    expect(axios.post).toHaveBeenCalledTimes(3);
  });

  it('should handle OpenRouter API errors with error message', async () => {
    const apiError = {
      response: {
        status: 400,
        data: {
          error: {
            message: 'Invalid request format',
            code: 400,
          },
        },
      },
      isAxiosError: true,
      message: 'Request failed with status code 400',
    };

    vi.mocked(axios.post).mockRejectedValue(apiError);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    await expect(summarizeWithAI('Test prompt')).rejects.toThrow(
      'OpenRouter API error: Invalid request format'
    );
    expect(axios.post).toHaveBeenCalledTimes(3);
  });

  it('should handle network errors', async () => {
    const networkError = {
      isAxiosError: true,
      message: 'Network Error',
    };

    vi.mocked(axios.post).mockRejectedValue(networkError);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    await expect(summarizeWithAI('Test prompt')).rejects.toThrow(
      'OpenRouter API error: Network Error'
    );
  });

  it('should handle unexpected errors', async () => {
    const unexpectedError = new Error('Unexpected error');

    vi.mocked(axios.post).mockRejectedValue(unexpectedError);
    vi.mocked(axios.isAxiosError).mockReturnValue(false);

    await expect(summarizeWithAI('Test prompt')).rejects.toThrow('Unexpected error');
  });

  it('should include HTTP-Referer and X-Title headers', async () => {
    const mockResponse = {
      data: {
        choices: [
          {
            message: {
              content: '{"title":"Test"}',
            },
          },
        ],
      },
    };

    vi.mocked(axios.post).mockResolvedValue(mockResponse);

    await summarizeWithAI('Test prompt');

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({
        headers: expect.objectContaining({
          'HTTP-Referer': 'https://github.com/newsletter-automation',
          'X-Title': 'Newsletter Automation',
        }),
      })
    );
  });

  it('should use correct model', async () => {
    const mockResponse = {
      data: {
        choices: [
          {
            message: {
              content: '{"title":"Test"}',
            },
          },
        ],
      },
    };

    vi.mocked(axios.post).mockResolvedValue(mockResponse);

    await summarizeWithAI('Test prompt');

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        model: 'meta-llama/llama-3.3-70b-instruct-free',
      }),
      expect.any(Object)
    );
  });

  it('should set 30 second timeout', async () => {
    const mockResponse = {
      data: {
        choices: [
          {
            message: {
              content: '{"title":"Test"}',
            },
          },
        ],
      },
    };

    vi.mocked(axios.post).mockResolvedValue(mockResponse);

    await summarizeWithAI('Test prompt');

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({
        timeout: 30000,
      })
    );
  });
});
