export type { Article, FreshRSSItem, FreshRSSResponse } from './freshrss/types.js';
export type { ScoredArticle } from './ai/scoring.js';
export type { Digest } from './aggregator.js';

/** Email to send to Gmail Output/* labels */
export interface OutputEmail {
  to: string;
  subject: string;
  htmlBody: string;
  outputLabel: string;
}

/** Domain configuration (color, labels, FreshRSS stream) */
export interface DomainConfig {
  label: 'Java' | 'Vue' | 'Angular' | 'DevOps' | 'AI' | 'Architecture' | 'Security' | 'Frontend';
  color: string;
  outputLabel: string;
  freshrssStreamId: string;
}
