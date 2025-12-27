# Story 51: Main Orchestration (Index.ts Update)

**ID**: 51-MAIN-ORCHESTRATION
**Type**: Execution & Orchestration
**Status**: 🔄 Update needed
**Effort**: 30 minutes
**Dependencies**: 21-FRESHRSS-CLIENT, 41-AGGREGATION

---

## Goal

Update `src/index.ts` to use FreshRSS client instead of Feedly, keeping all other logic intact.

---

## Changes to `src/index.ts`

### Current Imports (Feedly)

```typescript
import { fetchFeedlyArticles } from './feedly/client.js';
```

### New Imports (FreshRSS)

```typescript
import { fetchArticlesForStream } from './freshrss/client.js';
```

### Current Flow

```typescript
const articles = await fetchFeedlyArticles(javaDomain.feedlyCollectionId, 20);
```

### New Flow

```typescript
const articles = await fetchArticlesForStream(javaDomain.freshrssStreamId, 20);
```

---

## Complete Updated `src/index.ts`

```typescript
import dotenv from 'dotenv';
import logger from './logger.js';
import { sendEmail } from './gmail/send.js';
import { fetchArticlesForStream } from './freshrss/client.js';  // ← CHANGED
import { scoreArticles } from './ai/scoring.js';
import { aggregateByScore } from './aggregator.js';
import { renderDigest } from './renderer.js';
import { DOMAINS } from './config.js';
import type { OutputEmail } from './types.js';

dotenv.config();

function getCurrentWeek(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const week = Math.ceil((dayOfYear + 1) / 7);
  return `Week ${week}, ${now.getFullYear()}`;
}

async function main() {
  const startTime = Date.now();

  try {
    logger.info('🚀 Starting Tech Digest Batch (FreshRSS + Claude Haiku)');

    const userEmail = process.env.USER_EMAIL;
    if (!userEmail) {
      throw new Error('USER_EMAIL environment variable not set');
    }

    // Currently MVP: Java only
    // TODO: Loop over DOMAINS for multi-domain support
    const javaDomain = DOMAINS[0];
    logger.info(`📁 Domain: ${javaDomain.label}`);

    // Fetch articles from FreshRSS
    logger.info('📡 Fetching articles from FreshRSS...');
    const articles = await fetchArticlesForStream(javaDomain.freshrssStreamId, 20);  // ← CHANGED

    if (articles.length === 0) {
      logger.warn('No articles fetched from FreshRSS, skipping digest');
      return;
    }

    logger.info(`✓ Fetched ${articles.length} articles`);

    // Score articles with Claude Haiku
    logger.info('🤖 Scoring articles with Claude Haiku...');
    const scoredArticles = await scoreArticles(articles, 'java');

    if (scoredArticles.length === 0) {
      logger.warn('No articles successfully scored, skipping digest');
      return;
    }

    logger.info(`✓ Scored ${scoredArticles.length} articles`);

    // Aggregate by score (with TDAH limits: max 5 articles)
    const digest = aggregateByScore(scoredArticles);
    logger.info(
      `📊 Digest breakdown: ${digest.critical.length} critical, ` +
      `${digest.important.length} important, ${digest.bonus.length} bonus`
    );

    // Render HTML digest
    logger.info('🎨 Rendering HTML digest...');
    const htmlBody = renderDigest(digest, javaDomain);

    // Send email
    const outputEmail: OutputEmail = {
      to: userEmail,
      subject: `[${javaDomain.label}] Tech Digest - ${getCurrentWeek()}`,
      htmlBody,
      outputLabel: javaDomain.outputLabel,
    };

    logger.info('📧 Sending tech digest email...');
    await sendEmail(outputEmail);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(`\n${'='.repeat(60)}`);
    logger.info(`✅ Tech Digest completed in ${duration}s`);
    logger.info(`${'='.repeat(60)}`);

  } catch (error) {
    logger.error(`❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

main();
```

---

## Key Changes

| Aspect | Feedly | FreshRSS |
|--------|--------|----------|
| Client | `fetchFeedlyArticles()` | `fetchArticlesForStream()` |
| Config field | `feedlyCollectionId` | `freshrssStreamId` |
| No other changes | Everything else identical | ✅ No breaking changes |

---

## Multi-Domain Expansion (Future)

When ready to support multiple domains, update the loop:

```typescript
async function main() {
  // ... setup ...

  for (const domain of DOMAINS) {
    logger.info(`📁 Processing: ${domain.label}`);

    const articles = await fetchArticlesForStream(domain.freshrssStreamId, 20);
    const scoredArticles = await scoreArticles(articles, domain.label.toLowerCase());
    const digest = aggregateByScore(scoredArticles);
    const htmlBody = renderDigest(digest, domain);

    const outputEmail: OutputEmail = {
      to: userEmail,
      subject: `[${domain.label}] Tech Digest - ${getCurrentWeek()}`,
      htmlBody,
      outputLabel: domain.outputLabel,
    };

    await sendEmail(outputEmail);
  }
}
```

---

## Implementation Checklist

- [ ] Update import: `from './freshrss/client.js'`
- [ ] Replace `fetchFeedlyArticles()` with `fetchArticlesForStream()`
- [ ] Update field reference: `feedlyCollectionId` → `freshrssStreamId`
- [ ] Verify TypeScript: `pnpm run build`
- [ ] Test locally: `pnpm start`
- [ ] Check logs for expected flow

---

## Testing

```bash
# Build and verify no errors
pnpm run build

# Run locally (requires FRESHRSS_* env vars)
export FRESHRSS_BASE_URL="https://rss.your-domain.com"
export FRESHRSS_TOKEN="your-token"
export GMAIL_CLIENT_ID="..."
export GMAIL_CLIENT_SECRET="..."
export GMAIL_REFRESH_TOKEN="..."
export USER_EMAIL="you@example.com"

pnpm start

# Expected output:
# 🚀 Starting Tech Digest Batch (FreshRSS + Claude Haiku)
# 📁 Domain: Java
# 📡 Fetching articles from FreshRSS...
# ✓ Fetched 20 articles
# 🤖 Scoring articles with Claude Haiku...
# ✓ Scored 20 articles
# 📊 Digest breakdown: 2 critical, 2 important, 1 bonus
# 🎨 Rendering HTML digest...
# 📧 Sending tech digest email...
# ✅ Tech Digest completed in X.XXs
```

---

## Backwards Compatibility

✅ **No breaking changes** to:
- Email output format
- Gmail API integration
- Logger interface
- Type definitions

---

**Dependencies**: 21-FRESHRSS-CLIENT, 41-AGGREGATION
**Next Stories**:
- 54-ENV-CONFIG (update environment variables)
- 71-DELETE-FEEDLY (remove old Feedly code)
