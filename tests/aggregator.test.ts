import { describe, it, expect } from 'vitest';
import { aggregateByScore } from '../src/aggregator.js';
import type { ScoredArticle } from '../src/ai/scoring.js';

const createMockArticle = (id: string, score: number): ScoredArticle => ({
  id,
  title: `Article ${id}`,
  summary: 'Test summary',
  url: 'https://example.com',
  publishedAt: new Date(),
  source: 'example.com',
  score,
  reason: 'Test reason',
});

describe('aggregateByScore', () => {
  it('should group articles into critical (8-10)', () => {
    const articles = [
      createMockArticle('1', 10),
      createMockArticle('2', 9),
      createMockArticle('3', 8),
      createMockArticle('4', 7),
    ];

    const digest = aggregateByScore(articles);

    expect(digest.critical).toHaveLength(3);
    expect(digest.critical.map((a) => a.id)).toEqual(['1', '2', '3']);
  });

  it('should group articles into important (6-7)', () => {
    const articles = [
      createMockArticle('1', 7),
      createMockArticle('2', 6),
      createMockArticle('3', 5),
    ];

    const digest = aggregateByScore(articles);

    expect(digest.important).toHaveLength(2);
    expect(digest.important.map((a) => a.id)).toEqual(['1', '2']);
  });

  it('should group articles into bonus (3-5)', () => {
    const articles = [
      createMockArticle('1', 5),
      createMockArticle('2', 4),
      createMockArticle('3', 3),
      createMockArticle('4', 2),
    ];

    const digest = aggregateByScore(articles);

    expect(digest.bonus).toHaveLength(3);
    expect(digest.bonus.map((a) => a.id)).toEqual(['1', '2', '3']);
  });

  it('should filter out low scores (1-2)', () => {
    const articles = [
      createMockArticle('1', 8),
      createMockArticle('2', 2),
      createMockArticle('3', 1),
    ];

    const digest = aggregateByScore(articles);

    expect(digest.critical).toHaveLength(1);
    expect(digest.important).toHaveLength(0);
    expect(digest.bonus).toHaveLength(0);
    expect(digest.total).toBe(3);
  });

  it('should sort articles by score within each tier (descending)', () => {
    const articles = [
      createMockArticle('1', 6),
      createMockArticle('2', 9),
      createMockArticle('3', 7),
      createMockArticle('4', 10),
      createMockArticle('5', 8),
    ];

    const digest = aggregateByScore(articles);

    expect(digest.critical.map((a) => a.score)).toEqual([10, 9, 8]);
    expect(digest.important.map((a) => a.score)).toEqual([7, 6]);
  });

  it('should handle empty input array', () => {
    const digest = aggregateByScore([]);

    expect(digest.critical).toHaveLength(0);
    expect(digest.important).toHaveLength(0);
    expect(digest.bonus).toHaveLength(0);
    expect(digest.total).toBe(0);
  });

  it('should set total to input array length', () => {
    const articles = [
      createMockArticle('1', 10),
      createMockArticle('2', 5),
      createMockArticle('3', 2),
    ];

    const digest = aggregateByScore(articles);

    expect(digest.total).toBe(3);
  });

  it('should handle all articles in same tier', () => {
    const articles = [
      createMockArticle('1', 8),
      createMockArticle('2', 9),
      createMockArticle('3', 10),
    ];

    const digest = aggregateByScore(articles);

    expect(digest.critical).toHaveLength(3);
    expect(digest.important).toHaveLength(0);
    expect(digest.bonus).toHaveLength(0);
  });
});
