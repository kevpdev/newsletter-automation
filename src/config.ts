import { DomainConfig } from './types.js';

/**
 * Tech watch domains configuration
 * Each domain has:
 * - label: Display name for emails
 * - color: Accent color (used in HTML emails)
 * - outputLabel: Gmail label for digest emails
 * - freshrssStreamId: FreshRSS stream/label ID
 *
 * Environment variables:
 * - FRESHRSS_[DOMAIN]_STREAM_ID: Override FreshRSS stream ID per domain
 * - If not set, defaults to 'user/-/label/[Domain]'
 */
export const DOMAINS: DomainConfig[] = [
  {
    label: 'Java',
    color: '#FF6B6B',
    outputLabel: 'Output/Java',
    freshrssStreamId: process.env.FRESHRSS_JAVA_STREAM_ID || 'user/-/label/Java',
  },
  {
    label: 'Vue',
    color: '#42B983',
    outputLabel: 'Output/Vue',
    freshrssStreamId: process.env.FRESHRSS_VUE_STREAM_ID || 'user/-/label/Vue',
  },
  {
    label: 'Angular',
    color: '#DD0031',
    outputLabel: 'Output/Angular',
    freshrssStreamId: process.env.FRESHRSS_ANGULAR_STREAM_ID || 'user/-/label/Angular',
  },
  {
    label: 'DevOps',
    color: '#1D63F7',
    outputLabel: 'Output/DevOps',
    freshrssStreamId: process.env.FRESHRSS_DEVOPS_STREAM_ID || 'user/-/label/DevOps',
  },
  {
    label: 'AI',
    color: '#9D4EDD',
    outputLabel: 'Output/AI',
    freshrssStreamId: process.env.FRESHRSS_AI_STREAM_ID || 'user/-/label/AI',
  },
  {
    label: 'Architecture',
    color: '#3A86FF',
    outputLabel: 'Output/Architecture',
    freshrssStreamId: process.env.FRESHRSS_ARCHITECTURE_STREAM_ID || 'user/-/label/Architecture',
  },
  {
    label: 'Security',
    color: '#FB5607',
    outputLabel: 'Output/Security',
    freshrssStreamId: process.env.FRESHRSS_SECURITY_STREAM_ID || 'user/-/label/Security',
  },
  {
    label: 'Frontend',
    color: '#8338EC',
    outputLabel: 'Output/Frontend',
    freshrssStreamId: process.env.FRESHRSS_FRONTEND_STREAM_ID || 'user/-/label/Frontend',
  },
];

export function getDomainByLabel(label: string): DomainConfig {
  const domain = DOMAINS.find(d => d.label === label);
  if (!domain) {
    throw new Error(`Unknown domain: ${label}`);
  }
  return domain;
}
