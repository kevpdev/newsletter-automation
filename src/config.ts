import { DomainConfig } from './types.js';

/**
 * Java domain configuration (MVP)
 * Proactive tech watch via Feedly Collections + Claude Haiku scoring
 */
export const DOMAINS: DomainConfig[] = [
  {
    label: 'Java',
    color: '#FF6B6B',
    outputLabel: 'Output/Java',
    feedlyCollectionId: process.env.FEEDLY_JAVA_COLLECTION_ID || '',
  },
];

/**
 * Other domains (ready for future extension)
 * Uncomment to add more tech watches
 */
// { label: 'Vue', color: '#42B983', outputLabel: 'Output/Vue' },
// { label: 'Angular', color: '#DD0031', outputLabel: 'Output/Angular' },
// { label: 'DevOps', color: '#1D63F7', outputLabel: 'Output/DevOps' },
// { label: 'AI', color: '#9D4EDD', outputLabel: 'Output/AI' },
// { label: 'Architecture', color: '#3A86FF', outputLabel: 'Output/Architecture' },
// { label: 'Security', color: '#FB5607', outputLabel: 'Output/Security' },
// { label: 'Frontend', color: '#8338EC', outputLabel: 'Output/Frontend' },
