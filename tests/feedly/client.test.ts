import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchFeedlyArticles } from '../../src/feedly/client.js';

vi.mock('axios');
vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('fetchFeedlyArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FEEDLY_API_TOKEN = 'test-token';
  });

  it('should fetch and normalize articles from Feedly API', async () => {
    const mockResponse = {
      data: {
        items: [
          {
            id: 'article-1',
            title: 'Test Article',
            summary: { content: 'Test summary' },
            originId: 'https://example.com/article',
            published: 1704067200000,
            alternate: [{ href: 'https://example.com/article' }],
          },
        ],
      },
    };

    vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

    const articles = await fetchFeedlyArticles('test-collection', 10);

    expect(articles).toHaveLength(1);
    expect(articles[0]).toEqual({
      id: 'article-1',
      title: 'Test Article',
      summary: 'Test summary',
      url: 'https://example.com/article',
      publishedAt: new Date(1704067200000),
      source: 'example.com',
    });
  });

  it('should throw error if API key missing', async () => {
    delete process.env.FEEDLY_API_TOKEN;

    await expect(fetchFeedlyArticles('test-collection', 10)).rejects.toThrow(
      'FEEDLY_API_TOKEN environment variable not set'
    );
  });

  it('should handle empty collection gracefully', async () => {
    const mockResponse = {
      data: {
        items: [],
      },
    };

    vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

    const articles = await fetchFeedlyArticles('test-collection', 10);

    expect(articles).toHaveLength(0);
  });

  it('should normalize article URLs correctly from originId', async () => {
    const mockResponse = {
      data: {
        items: [
          {
            id: 'article-1',
            title: 'Test',
            summary: { content: 'Summary' },
            originId: 'https://blog.example.com/post',
            published: 1704067200000,
          },
        ],
      },
    };

    vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

    const articles = await fetchFeedlyArticles('test-collection', 10);

    expect(articles[0].url).toBe('https://blog.example.com/post');
    expect(articles[0].source).toBe('blog.example.com');
  });

  it('should handle missing summary gracefully', async () => {
    const mockResponse = {
      data: {
        items: [
          {
            id: 'article-1',
            title: 'Test',
            originId: 'https://example.com',
            published: 1704067200000,
          },
        ],
      },
    };

    vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

    const articles = await fetchFeedlyArticles('test-collection', 10);

    expect(articles[0].summary).toBe('');
  });

  it('should retry on 429 rate limit', async () => {
    const error429 = {
      response: { status: 429 },
      message: 'Rate limit exceeded',
      isAxiosError: true,
    };

    vi.mocked(axios.get)
      .mockRejectedValueOnce(error429)
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              id: 'article-1',
              title: 'Test',
              originId: 'https://example.com',
              published: 1704067200000,
            },
          ],
        },
      });

    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    const articles = await fetchFeedlyArticles('test-collection', 10);

    expect(articles).toHaveLength(1);
    expect(axios.get).toHaveBeenCalledTimes(2);
  });
});
