# Feature: Feedly Collections + AI Scoring Pipeline

## Current State

**App Structure:**
```
src/
├── index.ts              # Main orchestrator
├── ai/openrouter.ts      # Perplexity search (hebdo)
├── markdown-converter.ts
├── renderer.ts           # HTML generation
└── gmail/                # OAuth2 + send
```

**Flow:** Perplexity search → Parse MD → Render HTML → Gmail send (weekly)

---

## Proposed Changes

### 1. Add Feedly Collections Layer

**New files:**
```
src/feedly/
├── index.ts       # Async getFeedlyCollectionArticles(token, collectionId)
├── types.ts       # Article, FeedlyResponse, Collection
└── config.ts      # Domain configurations
```

**Interface (src/feedly/types.ts):**
```typescript
interface Article {
  id: string;
  title: string;
  summary?: string;
  content?: { content: string };
  published: number;
  origin?: { title: string };
}

interface FeedlyResponse {
  entries: Article[];
  continuation?: string;
}

interface Collection {
  id: string;
  label: string;
}
```

**Domain Config (src/feedly/config.ts):**
```typescript
interface DomainConfig {
  name: string;
  collectionId: string;
  emoji: string;
}

export const DOMAINS: Record<string, DomainConfig> = {
  java: {
    name: "Java",
    collectionId: process.env.FEEDLY_JAVA_COLLECTION_ID || "",
    emoji: "☕"
  },
  vue: {
    name: "Vue",
    collectionId: process.env.FEEDLY_VUE_COLLECTION_ID || "",
    emoji: "💚"
  },
  angular: {
    name: "Angular",
    collectionId: process.env.FEEDLY_ANGULAR_COLLECTION_ID || "",
    emoji: "🔴"
  }
};
```

**Function (src/feedly/index.ts):**
```typescript
export async function getFeedlyCollectionArticles(
  token: string,
  collectionId: string,
  limit: number = 20
): Promise<Article[]>
```
- GET `https://api.feedly.com/v3/articles?collectionId=${collectionId}`
- Header: `Authorization: Bearer ${token}`
- Exponential backoff on 429
- Return last N entries (default 20)

**Helper:**
```typescript
export async function getFeedlyCollections(token: string): Promise<Collection[]>
```
- GET `https://api.feedly.com/v3/collections`
- Use to discover available collections (optional debugging)

---

### 2. Add Scoring (Claude Haiku)

**New file: src/ai/scoring.ts**

**Interface:**
```typescript
interface ScoredArticle {
  article: Article;
  score: number;    // 1-10
  reason: string;   // "Security CVE" | "Framework release" | etc
}
```

**Function:**
```typescript
export async function scoreArticles(
  articles: Article[],
  apiKey: string,
  domainName: string  // "Java" | "Vue" | "Angular"
): Promise<ScoredArticle[]>
```

**Logic:**
1. For each article: create domain-specific scoring prompt
2. Call Claude 3.5 Haiku via OpenRouter (same client)
3. Parse response: extract score (1-10) + reason
4. Return scored list

**Prompt template:**
```
"Rate this {domainName} article's importance for a {domainName} dev (1-10):
Title: {title}
Summary: {summary}

Respond ONLY as: SCORE REASON
Example: 8 Critical security patch in Vue Router"
```

---

### 3. Add Aggregation Layer

**New file: src/aggregator.ts**

**Interface:**
```typescript
interface Digest {
  critical: ScoredArticle[];   // score >= 8
  important: ScoredArticle[];  // 6-7
  bonus: ScoredArticle[];      // 3-5 (optional)
  timestamp: Date;
}
```

**Function:**
```typescript
export function createDigest(scored: ScoredArticle[]): Digest
```
- Filter by score thresholds
- Sort critical by score (desc)
- Exclude score < 3

---

### 4. Update Renderer

**Modify: src/renderer.ts**

**Input change:**
```typescript
// OLD: { sections: Array<{title, bullets}> }
// NEW: renderDigest(digest: Digest, domainName: string, emoji: string): string
```

**Render 3 sections with domain emoji:**
1. `<h2>{emoji} Critiques (Score 8+)</h2>`
   - List: `[9/10] Title → Reason`
2. `<h2>📌 Important (Score 6-7)</h2>`
   - List: `[7/10] Title → Reason`
3. `<h2>💡 Bonus (Score 3-5)</h2>` (if > 0)
   - List: `[5/10] Title → Reason`

Keep existing colors (#FF6B6B for Java, #00D084 for Vue, #DD0031 for Angular)

---

### 5. Update Main Orchestrator

**Modify: src/index.ts**

```typescript
import { DOMAINS } from './feedly/config';
import { getFeedlyCollectionArticles } from './feedly/index';
import { scoreArticles } from './ai/scoring';
import { createDigest } from './aggregator';
import { renderDigest } from './renderer';
import { sendEmail } from './gmail/send';

async function runDigestForDomain(
  domainKey: string,
  config: DomainConfig
): Promise<void> {
  logger.info(`📁 Domain: ${config.name}`);
  
  // 1. Fetch
  const articles = await getFeedlyCollectionArticles(
    process.env.FEEDLY_API_TOKEN!,
    config.collectionId
  );
  
  // 2. Score
  const scored = await scoreArticles(
    articles,
    process.env.OPENROUTER_API_KEY!,
    config.name
  );
  
  // 3. Aggregate
  const digest = createDigest(scored);
  
  // 4. Render
  const html = renderDigest(digest, config.name, config.emoji);
  
  // 5. Send
  await sendEmail(
    html,
    `[${config.name}] Tech Watch - Week ${getWeekNumber()}`
  );
  
  logger.info(`✅ ${config.name} Tech Watch completed`);
}

// Main
async function main(): Promise<void> {
  for (const [domainKey, config] of Object.entries(DOMAINS)) {
    if (!config.collectionId) {
      logger.warn(`⚠️ Skipping ${config.name}: collectionId not configured`);
      continue;
    }
    await runDigestForDomain(domainKey, config);
  }
}

main().catch(logger.error);
```

Keep existing email logic (gmail/send.ts), just update subject line

---

## Configuration Changes

**Add to .env:**
```
# Feedly Collections
FEEDLY_API_TOKEN=xxxxx
FEEDLY_JAVA_COLLECTION_ID=user/xxx/tag/development/Java
FEEDLY_VUE_COLLECTION_ID=user/xxx/tag/frontend/Vue
FEEDLY_ANGULAR_COLLECTION_ID=user/xxx/tag/frontend/Angular

# OPENROUTER_API_KEY already exists (reuse for Haiku)
```

**How to find collection IDs:**
1. Go to https://feedly.com/settings/collections
2. Curl API: `curl -H "Authorization: Bearer TOKEN" https://api.feedly.com/v3/collections`
3. Match collection names to IDs in response

---

## Dependencies

**No new packages needed.**
- Feedly API: native fetch (like Perplexity already)
- Claude Haiku: use existing OpenRouter client

---

## Testing Checklist

- [ ] Feedly fetch returns articles for each collection
- [ ] Scoring: 10 articles → 10 scores (1-10)
- [ ] Digest: filter works correctly
- [ ] HTML: 3 sections render with correct emoji per domain
- [ ] Email: send with new HTML format + domain-specific subject
- [ ] Multi-domain: loop runs for all 3 domains

---

## Breaking Changes

**None.** 
- Old Perplexity search code: stays intact
- New Feedly pipeline: parallel
- Can enable/disable domains via .env (skip if collectionId empty)

---

## Performance Impact

**Per digest run (all domains):**
- Feedly fetch (3 domains): 6s (~1 API call each)
- Scoring (30 articles total): 60s (10 articles × 2s per Haiku call × 3)
- Aggregation: <1s
- Render: <1s
- Email: 6s (3 domains)
- **Total: ~73s** (worth the quality improvement)

**Token cost:**
- Haiku scoring: ~100 tokens × 10 articles × 3 domains = 3000 tokens/digest
- vs Perplexity: 750 tokens/week for full search
- **Net: +2250 tokens/week** (still manageable at ~$2/month)

---

## Rollout Plan

1. **Phase 1:** Implement Feedly collections + scoring (commit)
2. **Phase 2:** Test with manual trigger in main()
3. **Phase 3:** Verify each domain sends correct email
4. **Phase 4:** Update GitHub Actions cron to call new flow
5. **Phase 5:** Monitor digest quality for 2 weeks per domain
6. **Phase 6:** Adjust score thresholds based on feedback

---

## Optional Enhancements (Future)

- [ ] Store scores in SQLite (track trends per domain)
- [ ] Learn user feedback (mark useful/useless → adjust prompts)
- [ ] Schedule: Feedly daily digest per domain
- [ ] Enable/disable domains dynamically via env flag
