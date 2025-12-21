# PHASE-6: Main Orchestration

**Status**: ✅ Completed
**Effort**: 1h actual
**Dependencies**: PHASE-1 to PHASE-5 (all previous phases)

---

## Overview

Rewrite main orchestration flow to integrate Feedly → Scoring → Aggregation → Rendering → Gmail pipeline.

---

## Acceptance Criteria

- [x] Rewrite `src/index.ts` for new Feedly flow
- [x] Step 1: Fetch articles from Feedly collection
- [x] Step 2: Score articles with Claude Haiku (parallel)
- [x] Step 3: Aggregate by score into digest
- [x] Step 4: Render HTML email
- [x] Step 5: Send email to Gmail Output/* label
- [x] Error handling: Log failures, continue execution
- [x] Logging: Log article counts at each step
- [x] Java MVP: Hardcoded Java domain
- [x] Environment validation: Check FEEDLY_API_TOKEN exists

---

## Technical Details

### Pipeline Flow

```typescript
async function main() {
  // 1. Fetch from Feedly (20 articles)
  const articles = await fetchFeedlyArticles(
    javaDomain.feedlyCollectionId,
    20
  );
  logger.info(`Fetched ${articles.length} articles from Feedly`);

  // 2. Score with Claude Haiku (parallel)
  const scoredArticles = await scoreArticles(articles, 'java');
  logger.info(`Scored ${scoredArticles.length}/${articles.length} articles`);

  // 3. Aggregate by score
  const digest = aggregateByScore(scoredArticles);
  logger.info(`Digest: ${digest.critical.length} critical, ${digest.important.length} important, ${digest.bonus.length} bonus`);

  // 4. Render HTML
  const htmlBody = renderDigest(digest, javaDomain);

  // 5. Send email
  const outputEmail: OutputEmail = {
    to: process.env.USER_EMAIL || '',
    subject: `Java Tech Digest - ${new Date().toLocaleDateString('fr-FR')}`,
    htmlBody,
    outputLabel: javaDomain.outputLabel,
  };

  await sendEmail(outputEmail);
  logger.info('Email sent successfully');
}
```

### Environment Variables Required

```bash
# Feedly
FEEDLY_API_TOKEN=your_token
FEEDLY_JAVA_COLLECTION_ID=user/xxxxx/category/Java

# Gmail
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
USER_EMAIL=your@email.com

# OpenRouter
OPENROUTER_API_KEY=...
```

---

## Files Modified

**`src/index.ts`** (80 lines):
- Complete rewrite from Perplexity flow
- Removed: `searchWithPerplexity()`, `parseMarkdown()`, `buildPrompt()`
- Added: `fetchFeedlyArticles()`, `scoreArticles()`, `aggregateByScore()`
- Changed: `renderHTML()` → `renderDigest()`

---

## Error Handling

```typescript
main()
  .then(() => {
    logger.info('Newsletter automation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Newsletter automation failed', { error: error.message });
    process.exit(1);
  });
```

**Failure scenarios**:
1. **Missing env vars**: Feedly client throws error immediately
2. **Feedly API error**: Logged, process exits (no articles to score)
3. **Scoring failures**: Individual articles skipped, process continues
4. **Empty digest**: Email sent with "No articles this week" message
5. **Gmail error**: Logged, process exits (can't deliver)

---

## Logging Output

**Successful run**:
```
[INFO] Fetched 20 articles from Feedly
[INFO] Scored 18/20 articles (2 failed)
[INFO] Digest: 3 critical, 7 important, 8 bonus
[INFO] Email sent successfully
[INFO] Newsletter automation completed successfully
```

**Partial failure**:
```
[INFO] Fetched 20 articles from Feedly
[WARN] Failed to score article: Invalid JSON response
[INFO] Scored 17/20 articles (3 failed)
[INFO] Digest: 2 critical, 5 important, 10 bonus
[INFO] Email sent successfully
```

---

## Testing

No unit tests for main orchestration (integration-level).

**Manual testing**:
```bash
pnpm run build
pnpm start
```

**Expected output**: Email in Gmail `Output/Java` label with digest format.

---

## Implementation Notes

1. **Java MVP**: Hardcoded `javaDomain` constant (extensible later)
2. **Article count**: Fetch 20 (configurable parameter)
3. **Graceful degradation**: Scoring failures don't block email send
4. **Date formatting**: French locale for subject line
5. **Exit codes**: 0 = success, 1 = failure (CI/CD-friendly)

---

## Future Extensions

**Multi-domain support** (not implemented yet):
```typescript
const domains = [javaDomain, vueDomain, angularDomain];

for (const domain of domains) {
  // Run pipeline for each domain
  const articles = await fetchFeedlyArticles(domain.feedlyCollectionId);
  // ... rest of pipeline
}
```

**Batching** (not needed for 20 articles):
- Current: All 20 articles scored in parallel
- Future: If fetching 100+ articles, batch in groups of 20

**Scheduling** (GitHub Actions):
- Weekly cron: `0 8 * * 1` (Mondays 08:00 UTC)
- Manual trigger: `workflow_dispatch`

---

## Related Files

- Uses: `src/feedly/client.ts` (fetch)
- Uses: `src/ai/scoring.ts` (score)
- Uses: `src/aggregator.ts` (aggregate)
- Uses: `src/renderer.ts` (render)
- Uses: `src/gmail/send.ts` (send)
- Uses: `src/config.ts` (domain config)
- Uses: `src/logger.ts` (logging)
