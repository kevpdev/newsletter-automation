# PHASE-4: Score-Based Aggregation

**Status**: ✅ Completed
**Effort**: 30 min actual
**Dependencies**: PHASE-3 (scoring)

---

## Overview

Group scored articles into quality tiers (Critical, Important, Bonus) based on score thresholds.

---

## Acceptance Criteria

- [x] Create `src/aggregator.ts` with `aggregateByScore()` function
- [x] Define `Digest` interface with three tiers + total count
- [x] Critical tier: scores 8-10 (must-read updates)
- [x] Important tier: scores 6-7 (should read)
- [x] Bonus tier: scores 3-5 (nice to know)
- [x] Filter out low scores (1-2) completely
- [x] Sort articles by score descending within each tier
- [x] Calculate total count from input array length
- [x] Unit tests: grouping, filtering, sorting, edge cases

---

## Technical Details

### Score Thresholds

```typescript
Critical:  score >= 8  // Breaking changes, security, major releases
Important: score >= 6  // Framework updates, tooling, best practices
Bonus:     score >= 3  // Tutorials, minor updates, opinion pieces
Filtered:  score <= 2  // Duplicates, outdated content (excluded)
```

### Digest Interface

```typescript
export interface Digest {
  critical: ScoredArticle[];   // 8-10
  important: ScoredArticle[];  // 6-7
  bonus: ScoredArticle[];      // 3-5
  total: number;               // Original array length (before filtering)
}
```

### Algorithm

```typescript
export function aggregateByScore(scoredArticles: ScoredArticle[]): Digest {
  const critical = scoredArticles
    .filter(a => a.score >= 8)
    .sort((a, b) => b.score - a.score);

  const important = scoredArticles
    .filter(a => a.score >= 6 && a.score < 8)
    .sort((a, b) => b.score - a.score);

  const bonus = scoredArticles
    .filter(a => a.score >= 3 && a.score < 6)
    .sort((a, b) => b.score - a.score);

  return { critical, important, bonus, total: scoredArticles.length };
}
```

---

## Files Created

**`src/aggregator.ts`** (28 lines):
- `Digest` interface
- `aggregateByScore(scoredArticles)` - Main aggregation function

---

## Data Flow

```
ScoredArticle[] (mixed scores 1-10)
    ↓
Filter by thresholds + Sort descending
    ↓
Digest {
  critical: [10, 9, 8],
  important: [7, 6],
  bonus: [5, 4, 3],
  total: 20
}
```

---

## Testing

**`tests/aggregator.test.ts`** (8 tests):
1. ✅ Group articles into critical (8-10)
2. ✅ Group articles into important (6-7)
3. ✅ Group articles into bonus (3-5)
4. ✅ Filter out low scores (1-2)
5. ✅ Sort articles by score within each tier (descending)
6. ✅ Handle empty input array
7. ✅ Set total to input array length
8. ✅ Handle all articles in same tier

---

## Edge Cases Handled

1. **Empty input**: Returns empty tiers with `total: 0`
2. **All low scores**: All tiers empty, but total reflects input count
3. **All same tier**: Other tiers empty (e.g., all 8-10 → only critical)
4. **Duplicate scores**: Preserved in output, order undefined for ties

---

## Implementation Notes

1. **Pure function**: No side effects, no mutations
2. **Total count**: Reflects original input length (useful for "4 articles scored, 2 filtered")
3. **Descending sort**: Highest scores first within each tier
4. **Inclusive thresholds**: 8-10 (inclusive), 6-7 (inclusive), 3-5 (inclusive)
5. **No bias**: Score 8 is critical, score 7.99 is important (strict boundaries)

---

## ADHD-Friendly Rationale

**Why three tiers?**
- **Critical**: Red flag = immediate attention (security, breaking changes)
- **Important**: Blue = plan to read today (framework updates)
- **Bonus**: Green = read if time (tutorials, opinions)

**Visual scanning**:
- Each tier has distinct color in HTML renderer
- Emoji markers for quick identification (🔥 🔥 💡)
- Score in [9/10] format for instant priority assessment

---

## Related Files

- Uses: `src/ai/scoring.ts` (ScoredArticle type)
- Used by: `src/renderer.ts` (digest → HTML)
- Used by: `src/index.ts` (orchestration)
- Tests: `tests/aggregator.test.ts`
