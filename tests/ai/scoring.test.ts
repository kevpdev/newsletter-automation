import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scoreArticle, scoreArticles } from '../../src/ai/scoring.js';
import * as openrouter from '../../src/ai/openrouter.js';
import type { Article } from '../../src/feedly/types.js';

vi.mock('../../src/ai/openrouter.js');
vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const mockArticle: Article = {
  id: 'test-1',
  title: 'Spring Boot 3.3 Released',
  summary: 'Major observability improvements',
  url: 'https://spring.io/blog',
  publishedAt: new Date(),
  source: 'spring.io',
};

describe('scoreArticle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should score article and return ScoredArticle', async () => {
    const mockResponse = JSON.stringify({
      score: 8,
      reason: 'Major framework release with observability improvements',
    });

    vi.mocked(openrouter.summarizeWithAI).mockResolvedValueOnce(mockResponse);

    const result = await scoreArticle(mockArticle, 'java');

    expect(result).toEqual({
      ...mockArticle,
      score: 8,
      reason: 'Major framework release with observability improvements',
    });
  });

  it('should parse valid JSON score response', async () => {
    const mockResponse = JSON.stringify({ score: 9, reason: 'Critical update' });

    vi.mocked(openrouter.summarizeWithAI).mockResolvedValueOnce(mockResponse);

    const result = await scoreArticle(mockArticle, 'java');

    expect(result.score).toBe(9);
    expect(result.reason).toBe('Critical update');
  });

  it('should throw on score out of range (0)', async () => {
    const mockResponse = JSON.stringify({ score: 0, reason: 'Invalid' });

    vi.mocked(openrouter.summarizeWithAI).mockResolvedValueOnce(mockResponse);

    await expect(scoreArticle(mockArticle, 'java')).rejects.toThrow('Invalid score');
  });

  it('should throw on score out of range (11)', async () => {
    const mockResponse = JSON.stringify({ score: 11, reason: 'Invalid' });

    vi.mocked(openrouter.summarizeWithAI).mockResolvedValueOnce(mockResponse);

    await expect(scoreArticle(mockArticle, 'java')).rejects.toThrow('Invalid score');
  });

  it('should throw on missing reason', async () => {
    const mockResponse = JSON.stringify({ score: 8, reason: '' });

    vi.mocked(openrouter.summarizeWithAI).mockResolvedValueOnce(mockResponse);

    await expect(scoreArticle(mockArticle, 'java')).rejects.toThrow('reason');
  });

  it('should handle markdown fences in response', async () => {
    const mockResponse = '```json\n{"score": 7, "reason": "Good update"}\n```';

    vi.mocked(openrouter.summarizeWithAI).mockResolvedValueOnce(mockResponse);

    const result = await scoreArticle(mockArticle, 'java');

    expect(result.score).toBe(7);
    expect(result.reason).toBe('Good update');
  });

  it('should round fractional scores', async () => {
    const mockResponse = JSON.stringify({ score: 7.8, reason: 'Test' });

    vi.mocked(openrouter.summarizeWithAI).mockResolvedValueOnce(mockResponse);

    const result = await scoreArticle(mockArticle, 'java');

    expect(result.score).toBe(8);
  });
});

describe('scoreArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should score multiple articles in parallel', async () => {
    const articles: Article[] = [
      { ...mockArticle, id: '1', title: 'Article 1' },
      { ...mockArticle, id: '2', title: 'Article 2' },
    ];

    vi.mocked(openrouter.summarizeWithAI)
      .mockResolvedValueOnce(JSON.stringify({ score: 8, reason: 'Reason 1' }))
      .mockResolvedValueOnce(JSON.stringify({ score: 6, reason: 'Reason 2' }));

    const results = await scoreArticles(articles, 'java');

    expect(results).toHaveLength(2);
    expect(results[0].score).toBe(8);
    expect(results[1].score).toBe(6);
  });

  it('should continue if individual articles fail', async () => {
    const articles: Article[] = [
      { ...mockArticle, id: '1', title: 'Article 1' },
      { ...mockArticle, id: '2', title: 'Article 2' },
    ];

    vi.mocked(openrouter.summarizeWithAI)
      .mockRejectedValueOnce(new Error('API error'))
      .mockResolvedValueOnce(JSON.stringify({ score: 6, reason: 'Reason 2' }));

    const results = await scoreArticles(articles, 'java');

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('2');
  });

  it('should return only successful scores', async () => {
    const articles: Article[] = [
      { ...mockArticle, id: '1', title: 'Article 1' },
      { ...mockArticle, id: '2', title: 'Article 2' },
      { ...mockArticle, id: '3', title: 'Article 3' },
    ];

    vi.mocked(openrouter.summarizeWithAI)
      .mockResolvedValueOnce(JSON.stringify({ score: 8, reason: 'Good' }))
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce(JSON.stringify({ score: 5, reason: 'OK' }));

    const results = await scoreArticles(articles, 'java');

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('1');
    expect(results[1].id).toBe('3');
  });
});
