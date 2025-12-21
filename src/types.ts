export type { Article, FeedlyArticle, FeedlyResponse } from './feedly/types.js';
export type { ScoredArticle } from './ai/scoring.js';
export type { Digest } from './aggregator.js';

/** Email to send to Gmail Output/* labels */
export interface OutputEmail {
  to: string;
  subject: string;
  htmlBody: string;
  outputLabel: string;
}

/** Domain configuration (color, labels, Feedly collection) */
export interface DomainConfig {
  label: string;
  color: string;
  outputLabel: string;
  feedlyCollectionId: string;
}
