# PHASE-2: Feedly API Client

**Status**: ✅ Completed
**Effort**: 1h actual
**Dependencies**: PHASE-1 (types)

---

## Overview

Implement Feedly Collections API client to fetch curated tech articles with retry logic and normalization.

---

## Acceptance Criteria

- [x] Create `src/feedly/client.ts` with `fetchFeedlyArticles()` function
- [x] GET request to `https://cloud.feedly.com/v3/streams/contents`
- [x] Authorization via Bearer token from `FEEDLY_API_TOKEN` env var
- [x] Query params: `streamId={collectionId}`, `count={count}`, `ranked=newest`
- [x] Exponential backoff retry for 429 rate limits (1s, 2s, 4s)
- [x] Normalize `FeedlyArticle[]` → `Article[]` with fallbacks
- [x] Extract hostname from `originId` for source field
- [x] Handle missing summary (use "No summary available")
- [x] Handle missing alternate URLs (use `originId`)
- [x] Request timeout: 30 seconds
- [x] Unit tests: fetch, normalize, empty, retry, source extraction

---

## Technical Details

### API Endpoint

```
GET https://cloud.feedly.com/v3/streams/contents
Authorization: Bearer {FEEDLY_API_TOKEN}
Params:
  - streamId: user/xxxxx/category/Java
  - count: 20
  - ranked: newest
```

### Retry Logic

- **Trigger**: HTTP 429 (Too Many Requests)
- **Strategy**: Exponential backoff
- **Delays**: 1000ms → 2000ms → 4000ms
- **Max retries**: 3
- **Exit**: Throw error after 3rd retry

### Normalization

```typescript
FeedlyArticle → Article:
  id: feedly.id
  title: feedly.title
  summary: feedly.summary?.content || "No summary available"
  url: feedly.alternate?.[0]?.href || feedly.originId
  publishedAt: new Date(feedly.published)
  source: extractHostname(feedly.originId)
```

### Source Extraction

```typescript
originId: "https://www.baeldung.com/java-21-features"
  ↓
source: "baeldung.com"
```

---

## Files Created

**`src/feedly/client.ts`** (118 lines):
- `fetchFeedlyArticles(collectionId, count)` - Main fetch function
- `normalizeArticle(feedlyArticle)` - Converts FeedlyArticle → Article
- `sleep(ms)` - Async delay utility
- `isRateLimitError(error)` - Type guard for 429 errors

---

## Error Handling

1. **Missing API token**: Throw error immediately
2. **Network errors**: Logged, no retry
3. **429 Rate limit**: Exponential backoff, max 3 retries
4. **Malformed response**: Throw error with context
5. **Empty collection**: Return empty array (no error)

---

## Testing

**`tests/feedly/client.test.ts`** (6 tests):
1. ✅ Fetch and normalize articles
2. ✅ Handle empty collection
3. ✅ Retry on 429 with exponential backoff
4. ✅ Handle missing summary field
5. ✅ Handle missing alternate URLs
6. ✅ Extract hostname from originId

---

## Logging

```typescript
logger.info('Feedly API call successful', {
  collection_id: collectionId,
  articles_fetched: data.items.length,
  duration_ms: duration,
});
```

---

## Implementation Notes

1. **Production-ready**: Same retry strategy as OpenRouter client
2. **Token optimization**: No full response logging (only metadata)
3. **Graceful degradation**: Missing fields use fallbacks
4. **Type-safe**: All responses validated with type guards
5. **Future-proof**: Easy to add more collections (Vue, Angular, etc.)

---

## Related Files

- Uses: `src/feedly/types.ts`
- Used by: `src/index.ts` (main orchestration)
- Tests: `tests/feedly/client.test.ts`
