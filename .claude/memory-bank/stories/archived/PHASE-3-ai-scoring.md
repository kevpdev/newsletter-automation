# PHASE-3: AI Article Scoring

**Status**: ✅ Completed
**Effort**: 2h actual
**Dependencies**: PHASE-1 (types), PHASE-2 (Feedly client)

---

## Overview

Score articles 1-10 using Claude 3.5 Haiku via OpenRouter with domain-specific criteria and parallel batch processing.

---

## Acceptance Criteria

- [x] Create `src/ai/scoring-prompts.ts` with domain-specific scoring criteria
- [x] Create `src/ai/scoring.ts` with `scoreArticle()` and `scoreArticles()` functions
- [x] Use model: `anthropic/claude-3.5-haiku-20241022`
- [x] JSON response format: `{ score: number, reason: string }`
- [x] Validate: score 1-10 (inclusive), reason non-empty
- [x] Handle markdown fences in JSON responses (```json...```)
- [x] Round fractional scores (7.8 → 8)
- [x] Batch processing with `Promise.allSettled()` for graceful failures
- [x] Truncate long summaries to 500 chars to reduce tokens
- [x] Unit tests: parsing, validation, markdown fences, batch processing

---

## Technical Details

### Scoring Criteria (Java MVP)

**9-10 (Critical)**:
- JDK releases (e.g., Java 21, 22 preview features)
- Breaking changes in frameworks (Spring Boot, Quarkus)
- Security CVEs (Log4Shell-level severity)

**7-8 (High)**:
- Major framework versions (Spring 3.x, Hibernate 6.x)
- Performance improvements with benchmarks
- New tools/libraries (jOOQ, TestContainers updates)

**5-6 (Medium)**:
- Minor updates (Spring Boot 3.2.1 → 3.2.2)
- Tooling improvements (Maven, Gradle plugins)
- Conference talks/best practices

**3-4 (Low)**:
- Tutorials (already know the topic)
- Opinion pieces (no concrete info)
- Announcements without details

**1-2 (Skip)**:
- Duplicate content (already seen)
- Outdated content (Java 8 migration in 2025)

### Prompt Template

```typescript
export const SCORING_PROMPTS: Record<string, string> = {
  java: `You are a Java tech watch expert. Score 1-10 based on:
[criteria above]

Output JSON only (no markdown):
{
  "score": 8,
  "reason": "Spring Boot 3.3 introduces major observability improvements"
}

Article:
Title: {{TITLE}}
Summary: {{SUMMARY}}
Source: {{SOURCE}}`,
};
```

### Batch Processing

```typescript
export async function scoreArticles(
  articles: Article[],
  domain: string
): Promise<ScoredArticle[]> {
  const results = await Promise.allSettled(
    articles.map((article) => scoreArticle(article, domain))
  );

  return results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);
}
```

---

## Files Created

**`src/ai/scoring-prompts.ts`** (35 lines):
- Domain-specific scoring criteria
- Prompt templates with {{TITLE}}, {{SUMMARY}}, {{SOURCE}} placeholders

**`src/ai/scoring.ts`** (98 lines):
- `scoreArticle(article, domain)` - Score single article
- `scoreArticles(articles, domain)` - Batch score with Promise.allSettled
- `ScoredArticle` interface (extends Article with `score`, `reason`)

---

## Files Modified

**`src/ai/openrouter.ts`**:
- Removed `PERPLEXITY_MODEL` constant
- Removed `searchWithPerplexity()` function
- Made `model` parameter required (no default)

---

## Response Parsing

**Handles markdown fences**:
```
Input: ```json\n{"score": 7, "reason": "Good"}\n```
Output: { score: 7, reason: "Good" }
```

**Validates schema**:
- Score: Must be integer 1-10
- Reason: Must be non-empty string
- Throws on invalid data

**Rounds fractional scores**:
```typescript
score: 7.8 → Math.round(7.8) → 8
```

---

## Error Handling

1. **Individual article failure**: Log error, continue with others
2. **JSON parse error**: Log raw response, skip article
3. **Invalid score (0, 11)**: Throw validation error
4. **Empty reason**: Throw validation error
5. **API errors**: Propagate to caller (handled by OpenRouter retry logic)

---

## Testing

**`tests/ai/scoring.test.ts`** (10 tests):
1. ✅ Score article and return ScoredArticle
2. ✅ Parse valid JSON response
3. ✅ Throw on score 0 (out of range)
4. ✅ Throw on score 11 (out of range)
5. ✅ Throw on missing reason
6. ✅ Handle markdown fences in response
7. ✅ Round fractional scores
8. ✅ Score multiple articles in parallel
9. ✅ Continue if individual articles fail
10. ✅ Return only successful scores

---

## Performance Considerations

1. **Parallel scoring**: All articles scored simultaneously
2. **Token reduction**: Summaries truncated to 500 chars
3. **Graceful degradation**: Failures don't block other articles
4. **Model choice**: Haiku is fast and cost-effective for scoring tasks
5. **No retries**: OpenRouter client handles rate limits

---

## Implementation Notes

1. **Domain-driven**: Each domain (Java, Vue, Angular) has tailored scoring criteria
2. **JSON-only**: Prompt explicitly requests JSON, parser strips markdown fences
3. **Validation-first**: All AI responses validated before use (untrusted input)
4. **Extensible**: Easy to add new domains by updating `SCORING_PROMPTS`
5. **Production-tested**: 10/10 unit tests pass

---

## Related Files

- Uses: `src/ai/openrouter.ts` (API client)
- Uses: `src/ai/scoring-prompts.ts` (domain criteria)
- Used by: `src/index.ts` (main orchestration)
- Tests: `tests/ai/scoring.test.ts`
