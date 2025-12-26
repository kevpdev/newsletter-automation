# Story 21: FreshRSS API Client

**ID**: 21-FRESHRSS-CLIENT
**Type**: Data Collection (API Integration)
**Status**: ⏳ Pending (to implement)
**Effort**: 1.5 hours
**Dependencies**: 03-CORE-TYPES, 02-FRESHRSS-PREP

---

## Goal

Create FreshRSS API client to replace Feedly integration. Fetch articles from Google Reader-compatible FreshRSS API.

---

## Files to Create

### 1. `src/freshrss/types.ts`

Google Reader API response types:

```typescript
export interface FreshRSSItem {
  id: string;
  title: string;
  summary?: { content: string };
  canonical?: Array<{ href: string }>;
  alternate?: Array<{ href: string }>;
  published: number;              // Unix timestamp
  origin?: { title: string };
}

export interface FreshRSSResponse {
  items: FreshRSSItem[];
  continuation?: string;          // For pagination (not used in MVP)
}
```

### 2. `src/freshrss/client.ts`

Main API client:

```typescript
import axios from 'axios';
import logger from '../logger.js';
import type { Article } from '../types.js';
import type { FreshRSSResponse } from './types.js';

const FRESHRSS_BASE_URL = process.env.FRESHRSS_BASE_URL || 'http://localhost:8080';
const FRESHRSS_TOKEN = process.env.FRESHRSS_TOKEN || '';

const API_ENDPOINT = `${FRESHRSS_BASE_URL}/api/greader.php`;

export async function fetchArticlesForStream(
  streamId: string,
  count: number = 20,
  maxRetries: number = 3
): Promise<Article[]> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Fetching articles from stream: ${streamId} (attempt ${attempt}/${maxRetries})`);

      const response = await axios.get<FreshRSSResponse>(
        `${API_ENDPOINT}/reader/api/0/stream/contents/${streamId}`,
        {
          headers: {
            Authorization: `GoogleLogin auth=${FRESHRSS_TOKEN}`,
          },
          params: {
            n: count,
            xt: 'user/-/state/com.google/read',  // Exclude already read
          },
          timeout: 15000,
        }
      );

      const articles = response.data.items.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary?.content || '',
        url: extractUrl(item),
        publishedAt: new Date(item.published * 1000),
        source: item.origin?.title,
      }));

      logger.info(`✓ Fetched ${articles.length} articles from ${streamId}`);
      return articles;

    } catch (error) {
      lastError = error as Error;

      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const waitTime = Math.pow(2, attempt - 1) * 1000;
        logger.warn(`Rate limited (429), retrying in ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else if (attempt < maxRetries) {
        logger.warn(`Attempt ${attempt} failed: ${lastError.message}, retrying...`);
      }
    }
  }

  logger.error(`Failed to fetch articles after ${maxRetries} attempts: ${lastError?.message}`);
  throw lastError || new Error('Unknown error fetching FreshRSS articles');
}

function extractUrl(item: FreshRSSItem): string {
  // Prefer canonical, fallback to first alternate, fallback to placeholder
  if (item.canonical?.length) {
    return item.canonical[0].href;
  }
  if (item.alternate?.length) {
    return item.alternate[0].href;
  }
  // Fallback: construct URL from article ID if needed
  return `#article-${item.id}`;
}
```

---

## Implementation Checklist

- [ ] Create `src/freshrss/` directory
- [ ] Create `src/freshrss/types.ts` with FreshRSSItem, FreshRSSResponse
- [ ] Create `src/freshrss/client.ts` with fetchArticlesForStream()
- [ ] Test client manually: `pnpm start` with FRESHRSS_* env vars
- [ ] Verify articles are fetched correctly
- [ ] Handle errors gracefully (logging, retries)

---

## Key Implementation Notes

### Google Reader API Format

FreshRSS emulates Google Reader API:
- Base: `/api/greader.php`
- Stream contents: `/reader/api/0/stream/contents/{streamId}`
- Stream ID format: `user/-/label/Java` or `feed/xxxxx`

### Authentication

```
Header: Authorization: GoogleLogin auth=TOKEN
```

### Query Parameters

- `n`: Number of articles (default 20)
- `xt`: Exclude (e.g., `xt=user/-/state/com.google/read` = exclude read articles)

### Error Handling

- **429 (Rate limit)**: Retry with exponential backoff (1s, 2s, 4s)
- **401 (Auth)**: Token invalid → exit with error
- **Other errors**: Log and continue

---

## Testing

```bash
# Set environment variables
export FRESHRSS_BASE_URL="https://rss.your-domain.com"
export FRESHRSS_TOKEN="your-token-here"

# Run and check logs
pnpm start

# Expected output:
# ✓ Fetched 20 articles from user/-/label/Java
```

---

## Comparison: Feedly → FreshRSS

| Aspect | Feedly | FreshRSS |
|--------|--------|----------|
| Endpoint | `/v3/streams/contents` | `/reader/api/0/stream/contents/{id}` |
| Auth header | `Authorization: Bearer TOKEN` | `Authorization: GoogleLogin auth=TOKEN` |
| Rate limit | 429 response | Configurable (usually 100 req/hour) |
| Article fields | Feedly-specific | Standard Atom/RSS fields |

---

## Migration Notes

After this story:
1. Old `src/feedly/` can be deleted (story 71)
2. `src/index.ts` imports from `src/freshrss/client.js` instead
3. Everything else remains unchanged

---

**Dependencies**: 03-CORE-TYPES
**Next Stories**:
- 41-AGGREGATION (aggregates fetched articles by score)
- 51-MAIN-ORCHESTRATION (uses fetchArticlesForStream)
