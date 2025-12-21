import type { ScoredArticle } from './ai/scoring.js';

export interface Digest {
  critical: ScoredArticle[];
  important: ScoredArticle[];
  bonus: ScoredArticle[];
  total: number;
}

export function aggregateByScore(scoredArticles: ScoredArticle[]): Digest {
  const critical = scoredArticles
    .filter((a) => a.score >= 8)
    .sort((a, b) => b.score - a.score);

  const important = scoredArticles
    .filter((a) => a.score >= 6 && a.score < 8)
    .sort((a, b) => b.score - a.score);

  const bonus = scoredArticles
    .filter((a) => a.score >= 3 && a.score < 6)
    .sort((a, b) => b.score - a.score);

  return {
    critical,
    important,
    bonus,
    total: scoredArticles.length,
  };
}
