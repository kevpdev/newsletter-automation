# Story 41: Score-Based Aggregation (TDAH Limit)

**ID**: 41-AGGREGATION
**Type**: Output Generation (Data Processing)
**Status**: 🔄 Update needed
**Effort**: 30 minutes
**Dependencies**: 31-AI-SCORING (provides ScoredArticle[])

---

## Goal

Aggregate scored articles into digestible groups (Critical/Important/Bonus) with TDAH-friendly limits (max 5 articles total).

---

## Changes to `src/aggregator.ts`

### Current Behavior
Groups articles by score but no limits:
- Critical: all articles with score >= 8
- Important: all articles with score 6-7
- Bonus: all articles with score 3-5

### New Behavior
**TDAH Limits** (max 5 articles per digest):
- Critical: max 2 articles (score >= 8)
- Important: max 2 articles (score 6-7)
- Bonus: max 1 article (score 3-5)

### Updated Code

```typescript
import type { ScoredArticle, Digest } from './types.js';

const TDAH_LIMITS = {
  critical: 2,    // Must-read: max 2
  important: 2,   // Nice-to-have: max 2
  bonus: 1        // Extra: max 1
};

export function aggregateByScore(scoredArticles: ScoredArticle[]): Digest {
  // Sort by score descending
  const sorted = [...scoredArticles].sort((a, b) => b.score - a.score);

  // Apply TDAH limits
  const critical = sorted
    .filter(a => a.score >= 8)
    .slice(0, TDAH_LIMITS.critical);

  const important = sorted
    .filter(a => a.score >= 6 && a.score < 8)
    .slice(0, TDAH_LIMITS.important);

  const bonus = sorted
    .filter(a => a.score >= 3 && a.score < 6)
    .slice(0, TDAH_LIMITS.bonus);

  // Log aggregation stats
  logger.info(
    `📊 Digest breakdown: ${critical.length} critical, ` +
    `${important.length} important, ${bonus.length} bonus (total: ${critical.length + important.length + bonus.length}/${scoredArticles.length})`
  );

  return {
    critical,
    important,
    bonus,
    total: scoredArticles.length, // Original count for reference
  };
}
```

---

## Why These Limits?

### TDAH Context
- **Decision fatigue**: Too many articles = overwhelming
- **Sweet spot**: 3-5 articles per digest = manageable
- **Structure**: Clear tiers (critical/important/bonus) = easy scanning

### Breakdown
| Tier | Count | Purpose | Effort |
|------|-------|---------|--------|
| Critical | 2 | Must-read articles (score ≥ 8) | 5-10 min each |
| Important | 2 | Worth-reading (score 6-7) | 3-5 min each |
| Bonus | 1 | Nice-to-have (score 3-5) | 2-3 min each |
| **Total** | **5** | Complete digest | 15-30 min |

---

## Rendering Impact

The renderer (`src/renderer.ts`) already handles these three sections:

```typescript
const digest = aggregateByScore(scoredArticles);
const htmlBody = renderDigest(digest, domain);
```

Email output structure:
```
[Java] Tech Digest - Week X, 2025

🔥 CRITICAL (max 2)
├─ Article 1 (score 9/10)
└─ Article 2 (score 8/10)

🟠 IMPORTANT (max 2)
├─ Article 3 (score 7/10)
└─ Article 4 (score 6/10)

🟡 BONUS (max 1)
└─ Article 5 (score 5/10)
```

---

## Implementation Checklist

- [ ] Update `src/aggregator.ts` with TDAH_LIMITS
- [ ] Add `total` field to aggregated digest
- [ ] Verify TypeScript: `pnpm run build`
- [ ] Update tests if any (`src/aggregator.test.ts`)
- [ ] Test with actual scoring: `pnpm start`

---

## Testing

```bash
# Manual test
pnpm start

# Expected log output:
# 📊 Digest breakdown: 2 critical, 2 important, 1 bonus (total: 5/20)
# (assuming 20 articles were fetched)

# Check email output has max 5 articles
```

---

## Existing Code Reuse

✅ **No changes needed** to:
- `src/renderer.ts` - Already renders these 3 sections
- `src/types.ts` - Digest interface unchanged
- `src/index.ts` - Already calls aggregateByScore()

---

## Rationale

### Original System (Gmail Input/*)
- Processed 1 email → 1 email (no aggregation)
- Each output had: Title, Impact, 3 Points, Action

### New System (FreshRSS)
- Fetches 20 articles → scores them → picks top 5
- Digest shows: Critical (red) | Important (orange) | Bonus (yellow)
- Same ADHD-friendly principle: minimize choices, maximize clarity

---

**Dependencies**: 31-AI-SCORING
**Next Stories**:
- 42-HTML-DIGEST (renders these 3 tiers)
- 51-MAIN-ORCHESTRATION (calls aggregateByScore)
