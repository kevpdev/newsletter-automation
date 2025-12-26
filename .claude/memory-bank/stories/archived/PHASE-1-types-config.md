# PHASE-1: Types & Configuration

**Status**: ✅ Completed
**Effort**: 30 min actual
**Dependencies**: None

---

## Overview

Establish core TypeScript interfaces and domain configuration for Feedly-based tech watch system.

---

## Acceptance Criteria

- [x] Create `src/feedly/types.ts` with Feedly API response interfaces
- [x] Export `Article` interface as normalized format
- [x] Add `feedlyCollectionId` to `DomainConfig` in `src/types.ts`
- [x] Re-export Feedly types from `src/types.ts`
- [x] Update `src/config.ts` to include Java Feedly collection ID
- [x] Add `FEEDLY_API_TOKEN` and `FEEDLY_JAVA_COLLECTION_ID` to `.env.example`
- [x] Remove obsolete Perplexity types (ParsedMarkdown, MarkdownSection)

---

## Technical Details

### Files Created

**`src/feedly/types.ts`**:
```typescript
export interface FeedlyArticle {
  id: string;
  title: string;
  summary?: { content: string };
  originId: string;
  published: number;
  alternate?: Array<{ href: string }>;
}

export interface FeedlyResponse {
  items: FeedlyArticle[];
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: Date;
  source?: string;
}
```

### Files Modified

**`src/types.ts`**:
- Added: `export type { Article, FeedlyArticle, FeedlyResponse } from './feedly/types.js'`
- Added: `export type { ScoredArticle } from './ai/scoring.js'`
- Added: `export type { Digest } from './aggregator.js'`
- Added: `feedlyCollectionId: string` to `DomainConfig`
- Removed: `ParsedMarkdown`, `MarkdownSection` interfaces

**`src/config.ts`**:
- Added: `feedlyCollectionId: process.env.FEEDLY_JAVA_COLLECTION_ID || ''` to Java domain

**`.env.example`**:
- Added: `FEEDLY_API_TOKEN=your_feedly_api_token`
- Added: `FEEDLY_JAVA_COLLECTION_ID=user/xxxxx/category/Java`

---

## Data Flow

```
Feedly API Response → FeedlyArticle[]
    ↓ (normalize)
Article[] → ScoredArticle[] → Digest
```

---

## Implementation Notes

1. **Strict typing**: All Feedly fields optional except `id`, `title`, `originId`, `published`
2. **Normalization layer**: `FeedlyArticle` → `Article` conversion handles missing fields
3. **Environment-driven**: Collection IDs stored in env vars for easy multi-domain expansion
4. **Source extraction**: Hostname extracted from `originId` URL for attribution

---

## Testing

No unit tests required (type definitions only).

---

## Related Files

- `src/feedly/client.ts` (uses these types)
- `src/ai/scoring.ts` (extends Article → ScoredArticle)
- `src/aggregator.ts` (transforms ScoredArticle[] → Digest)
