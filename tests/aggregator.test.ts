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

    expect(digest.critical).toHaveLength(3); // All critical articles (no limit)
    expect(digest.critical.map((a) => a.id)).toEqual(['1', '2', '3']);
  });

  it('should group articles into important (6-7)', () => {
    const articles = [
      createMockArticle('1', 7),
      createMockArticle('2', 6),
      createMockArticle('3', 5),
    ];

    const digest = aggregateByScore(articles);

    expect(digest.important).toHaveLength(2); // All important articles
    expect(digest.important.map((a) => a.id)).toEqual(['1', '2']);
    expect(digest.bonus).toHaveLength(1); // Fill to reach min 5 (0+2+3 needed, 1 available)
    expect(digest.bonus.map((a) => a.id)).toEqual(['3']);
  });

  it('should group articles into bonus (3-5)', () => {
    const articles = [
      createMockArticle('1', 5),
      createMockArticle('2', 4),
      createMockArticle('3', 3),
      createMockArticle('4', 2),
    ];

    const digest = aggregateByScore(articles);

    expect(digest.bonus).toHaveLength(3); // All 3 bonus articles (fill to min 5, but only 3 available)
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

    expect(digest.critical.map((a) => a.score)).toEqual([10, 9, 8]); // All critical articles
    expect(digest.important.map((a) => a.score)).toEqual([7, 6]); // All important articles
    expect(digest.bonus).toHaveLength(0); // No bonus needed (3+2 = 5 = min)
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

    expect(digest.critical).toHaveLength(3); // All critical articles (no limit)
    expect(digest.important).toHaveLength(0);
    expect(digest.bonus).toHaveLength(0); // No bonus needed (3 >= min 5 is false, but no bonus available)
  });

  // New tests for adaptive filtering behavior
  it('should include 5 bonus articles when no critical/important exist', () => {
    const articles = [
      createMockArticle('1', 5),
      createMockArticle('2', 4.5),
      createMockArticle('3', 4),
      createMockArticle('4', 3.5),
      createMockArticle('5', 3),
      createMockArticle('6', 2.5),
    ];

    const digest = aggregateByScore(articles);

    expect(digest.critical).toHaveLength(0);
    expect(digest.important).toHaveLength(0);
    expect(digest.bonus).toHaveLength(5); // Top 5 bonus to reach min 5
    expect(digest.bonus[0].score).toBe(5);
    expect(digest.bonus[4].score).toBe(3);
  });

  it('should include all critical articles up to max limit', () => {
    const articles = [
      createMockArticle('1', 10),
      createMockArticle('2', 9),
      createMockArticle('3', 9),
      createMockArticle('4', 8.5),
      createMockArticle('5', 8),
      createMockArticle('6', 8),
      createMockArticle('7', 7.5),
      createMockArticle('8', 7),
    ];

    const digest = aggregateByScore(articles);

    expect(digest.critical).toHaveLength(6); // All 6 critical articles
    expect(digest.important).toHaveLength(2); // All 2 important articles
    expect(digest.bonus).toHaveLength(0); // No bonus needed (8 total)

    const totalArticles = digest.critical.length + digest.important.length + digest.bonus.length;
    expect(totalArticles).toBe(8);
  });

  it('should enforce 10 article maximum by trimming bonus', () => {
    const articles = [
      createMockArticle('1', 10),
      createMockArticle('2', 9),
      createMockArticle('3', 9),
      createMockArticle('4', 8),
      createMockArticle('5', 8),
      createMockArticle('6', 8),
      createMockArticle('7', 7),
      createMockArticle('8', 7),
      createMockArticle('9', 6),
      createMockArticle('10', 6),
      createMockArticle('11', 5),
      createMockArticle('12', 4),
      createMockArticle('13', 3),
    ];

    const digest = aggregateByScore(articles);

    expect(digest.critical).toHaveLength(6); // All critical articles
    expect(digest.important).toHaveLength(4); // All important articles
    expect(digest.bonus).toHaveLength(0); // Trimmed (10 - 6 - 4 = 0)

    const totalArticles = digest.critical.length + digest.important.length + digest.bonus.length;
    expect(totalArticles).toBe(10); // Enforces max cap
  });

  it('should return exactly 5 when mix reaches minimum', () => {
    const articles = [
      createMockArticle('1', 9),
      createMockArticle('2', 8),
      createMockArticle('3', 7),
      createMockArticle('4', 6),
      createMockArticle('5', 5),
    ];

    const digest = aggregateByScore(articles);

    expect(digest.critical).toHaveLength(2); // 9, 8
    expect(digest.important).toHaveLength(2); // 7, 6
    expect(digest.bonus).toHaveLength(1); // 5 (to reach min 5)

    const totalArticles = digest.critical.length + digest.important.length + digest.bonus.length;
    expect(totalArticles).toBe(5);
  });
});
