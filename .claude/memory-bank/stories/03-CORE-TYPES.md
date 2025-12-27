# Story 03: Core Types & Domain Configuration

**ID**: 03-CORE-TYPES
**Type**: TypeScript Types & Config
**Status**: 🔄 Update needed
**Effort**: 1 hour
**Dependencies**: 02-FRESHRSS-PREP

---

## Goal

Update TypeScript types and domain configuration to support FreshRSS stream IDs (replacing Feedly collection IDs).

---

## Changes Required

### File: `src/types.ts`

**Update `DomainConfig` interface**:

```typescript
export interface DomainConfig {
  label: 'Java' | 'Vue' | 'Angular' | 'DevOps' | 'AI' | 'Architecture' | 'Security' | 'Frontend';
  color: string;                    // Hex color #RRGGBB
  outputLabel: string;              // Gmail label: "Output/Java"
  freshrssStreamId: string;         // Google Reader format: "user/-/label/Java"
}

// Keep existing interfaces (no changes needed)
export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: Date;
  source?: string;
}

export interface ScoredArticle extends Article {
  score: number;           // 1-10
  reason: string;          // Why this score
}

export interface Digest {
  critical: ScoredArticle[];   // score >= 8
  important: ScoredArticle[];  // 6 <= score < 8
  bonus: ScoredArticle[];      // 3 <= score < 6
  total: number;
}

export interface OutputEmail {
  to: string;
  subject: string;
  htmlBody: string;
  outputLabel: string;
}
```

### File: `src/config.ts`

**Update domain configuration**:

```typescript
import type { DomainConfig } from './types.js';

export const DOMAINS: DomainConfig[] = [
  {
    label: 'Java',
    color: '#FF6B6B',
    outputLabel: 'Output/Java',
    freshrssStreamId: process.env.FRESHRSS_JAVA_STREAM_ID || 'user/-/label/Java'
  },
  // Commented out for MVP - uncomment as categories are added
  /*
  {
    label: 'Vue',
    color: '#42B983',
    outputLabel: 'Output/Vue',
    freshrssStreamId: process.env.FRESHRSS_VUE_STREAM_ID || 'user/-/label/Vue'
  },
  {
    label: 'Angular',
    color: '#DD0031',
    outputLabel: 'Output/Angular',
    freshrssStreamId: process.env.FRESHRSS_ANGULAR_STREAM_ID || 'user/-/label/Angular'
  },
  */
];

export function getDomainByLabel(label: string): DomainConfig {
  const domain = DOMAINS.find(d => d.label === label);
  if (!domain) {
    throw new Error(`Unknown domain: ${label}`);
  }
  return domain;
}
```

---

## Checklist

- [ ] Update `src/types.ts` - add `freshrssStreamId` to `DomainConfig`
- [ ] Update `src/config.ts` - replace Feedly collection IDs with FreshRSS stream IDs
- [ ] Verify TypeScript compilation: `pnpm run build`
- [ ] No other files need changes (types are internal)

---

## Testing

```bash
# Verify types compile
pnpm run build

# Should output: "✓ 0 errors"
```

---

## Key Differences from Feedly

| Aspect | Feedly | FreshRSS |
|--------|--------|----------|
| Collection ID | `collection/xxxxx/category/xxxxx` | `user/-/label/Java` |
| Source | Env var `FEEDLY_JAVA_COLLECTION_ID` | Env var `FRESHRSS_JAVA_STREAM_ID` |
| API response | Proprietary Feedly JSON | Google Reader format |

---

## References

- `src/types.ts` - Core interfaces
- `src/config.ts` - Domain mappings
- Story 02 - Stream ID values from FreshRSS

---

**Dependencies**: 02-FRESHRSS-PREP (has stream IDs)
**Next Stories**:
- 21-FRESHRSS-CLIENT (uses these stream IDs)
- 41-AGGREGATION (uses Digest interface)
