# Active Context

Last update: 2025-12-21

## Current Focus
**Migration Feedly Completed** - System migrated from Perplexity to Feedly Collections + Claude Haiku scoring (Phases 1-7)

## Architecture Status

### Current System (Feedly + Claude Haiku)
```
Feedly Collections (20 articles/domain)
  → Claude 3.5 Haiku scoring (1-10)
  → Aggregate by score (Critical 8+, Important 6-7, Bonus 3-5)
  → Digest HTML renderer
  → Gmail Output/*
```

### Previous System (Archived)
```
Gmail Input/* → Extract metadata → Perplexity search
  → Parse Markdown → Render HTML → Gmail Output/*
```

## Recent Changes (Migration)

[2025-12-21]: **PHASE-7 - Cleanup complete**: Deleted all Perplexity code (227 lines removed). Removed `src/ai/domain-prompts.ts`, `src/markdown-converter.ts`, 4 obsolete test files. Updated `src/ai/openrouter.ts` to remove Perplexity constants. Build passes, 50/50 tests passing. Stories reorganized with phase-based naming.

[2025-12-21]: **PHASE-6 - Orchestration complete**: Rewrote `src/index.ts` for Feedly pipeline (80 lines). Flow: fetchFeedlyArticles → scoreArticles (parallel) → aggregateByScore → renderDigest → sendEmail. Java MVP with hardcoded domain. Graceful error handling (scoring failures don't block email send). File: src/index.ts

[2025-12-21]: **PHASE-5 - Renderer complete**: Rewrote `src/renderer.ts` for digest format (135 lines). Three sections: 🔥 Critical (red), 📌 Important (blue), 💡 Bonus (green). Article format: `[9/10] Title` with link, reason, source. XSS protection with markdown link preservation. 26 passing unit tests. Files: src/renderer.ts, tests/renderer.test.ts

[2025-12-21]: **PHASE-4 - Aggregation complete**: Created `src/aggregator.ts` (28 lines) with score-based filtering. Digest interface with 3 tiers (critical 8+, important 6-7, bonus 3-5). Filters out low scores (1-2). Sorts by score descending within tiers. 8 passing unit tests. Files: src/aggregator.ts, tests/aggregator.test.ts

[2025-12-21]: **PHASE-3 - AI Scoring complete**: Created `src/ai/scoring.ts` (98 lines) and `src/ai/scoring-prompts.ts` (35 lines). Uses Claude 3.5 Haiku (`anthropic/claude-3.5-haiku-20241022`) via OpenRouter. JSON response validation (score 1-10, non-empty reason). Handles markdown fences, rounds fractional scores. Batch processing with `Promise.allSettled()`. Modified `src/ai/openrouter.ts` to remove Perplexity defaults. 10 passing unit tests. Files: src/ai/scoring.ts, src/ai/scoring-prompts.ts, tests/ai/scoring.test.ts

[2025-12-21]: **PHASE-2 - Feedly Client complete**: Created `src/feedly/client.ts` (118 lines) with Feedly Collections API integration. Exponential backoff retry for 429 rate limits (1s, 2s, 4s). Normalizes `FeedlyArticle` → `Article`. Extracts hostname from `originId` for source. Handles missing summary/URLs. 6 passing unit tests. Files: src/feedly/client.ts, tests/feedly/client.test.ts

[2025-12-21]: **PHASE-1 - Types & Config complete**: Created `src/feedly/types.ts` with Feedly API interfaces. Added `feedlyCollectionId` to `DomainConfig`. Re-exported Feedly types from `src/types.ts`. Updated `src/config.ts` with Java collection ID. Added `FEEDLY_API_TOKEN` and `FEEDLY_JAVA_COLLECTION_ID` to `.env.example`. Removed obsolete Perplexity types (`ParsedMarkdown`, `MarkdownSection`). Files: src/feedly/types.ts, src/types.ts, src/config.ts, .env.example

[2025-12-21]: **Story reorganization**: Archived 7 obsolete Perplexity stories to `.claude/memory-bank/stories/archived/`. Created 7 new phase-based stories (PHASE-1 to PHASE-7) with detailed specs, test counts, and implementation notes. Updated `INDEX.md` with migration summary and phase dependencies.

## Build & Test Status

- ✅ TypeScript compilation: 0 errors
- ✅ Tests: 50/50 passing
  - Feedly client: 6 tests
  - AI scoring: 10 tests
  - Aggregator: 8 tests
  - Renderer: 26 tests
- ✅ No orphaned imports

## Code Changes Summary

### Created Files (7 new files)
- `src/feedly/types.ts` - Feedly API interfaces
- `src/feedly/client.ts` - Feedly Collections API client
- `src/ai/scoring-prompts.ts` - Domain-specific scoring criteria
- `src/ai/scoring.ts` - Claude Haiku scoring engine
- `src/aggregator.ts` - Score-based filtering
- `tests/feedly/client.test.ts` - 6 tests
- `tests/ai/scoring.test.ts` - 10 tests
- `tests/aggregator.test.ts` - 8 tests

### Modified Files (6 files)
- `src/types.ts` - Added Feedly types, removed Perplexity types
- `src/config.ts` - Added `feedlyCollectionId` to domains
- `src/renderer.ts` - Rewritten for digest format (135 lines)
- `src/index.ts` - Rewritten for Feedly pipeline (80 lines)
- `src/ai/openrouter.ts` - Removed Perplexity constants/functions
- `.env.example` - Added Feedly credentials
- `tests/renderer.test.ts` - Updated for digest format (26 tests)

### Deleted Files (6 files, 227 lines removed)
- `src/ai/domain-prompts.ts` (31 lines)
- `src/markdown-converter.ts` (196 lines)
- `tests/ai/parser.test.ts` (obsolete)
- `tests/ai/prompt.test.ts` (obsolete)
- `tests/gmail/fetch.test.ts` (obsolete)
- `tests/gmail/extract.test.ts` (obsolete)

## Next Steps

### Immediate (PHASE-8)
1. [ ] Update `.github/workflows/run-batch.yml` for Feedly
2. [ ] Add GitHub Secrets: `FEEDLY_API_TOKEN`, `FEEDLY_JAVA_COLLECTION_ID`
3. [ ] Test workflow with manual trigger
4. [ ] Update CI-001 story as completed

### Short Term (Multi-Domain)
1. [ ] Create Vue Feedly collection
2. [ ] Create Angular Feedly collection
3. [ ] Add scoring prompts for Vue/Angular domains
4. [ ] Update orchestration to loop over multiple domains

### Medium Term (Production)
1. [ ] Deploy with weekly cron (Mondays 08:00 UTC)
2. [ ] Monitor logs for scoring failures
3. [ ] Adjust scoring criteria based on feedback
4. [ ] Optimize token usage (summary truncation)

## Environment Variables

### Required (Current)
```bash
# Feedly
FEEDLY_API_TOKEN=your_feedly_api_token
FEEDLY_JAVA_COLLECTION_ID=user/xxxxx/category/Java

# Gmail
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
USER_EMAIL=your@email.com

# OpenRouter
OPENROUTER_API_KEY=...
```

### Deprecated (Removed)
- Perplexity-related env vars (none were used)

## Challenges

✅ **RESOLVED - Perplexity to Feedly migration**: Replaced web search with curated collections. Scoring now uses Claude Haiku (1-10) instead of Markdown parsing. Digest format with score badges ([9/10]) for ADHD-friendly scanning.

✅ **RESOLVED - Test coverage**: Created 50 new unit tests covering all Feedly pipeline components. Deleted 4 obsolete test files for Perplexity system.

✅ **RESOLVED - XSS in renderer**: Implemented markdown link conversion before HTML escaping to preserve anchor tags while protecting against XSS.

## Decisions Made

### Migration
- **Feedly over Perplexity**: Curated collections provide higher signal-to-noise ratio
- **Claude Haiku scoring**: Cost-effective, fast, JSON-native responses
- **Score thresholds**: 8+ critical (red), 6-7 important (blue), 3-5 bonus (green), 1-2 filtered
- **Batch scoring**: `Promise.allSettled()` for parallel processing with graceful failures

### Architecture
- **1-to-1 flow**: Removed (no longer processing Gmail Input/*)
- **New flow**: Feedly collection → score all → aggregate → digest email
- **Java MVP**: Single domain for initial deployment, extensible for multi-domain
- **Weekly cadence**: One digest per domain per week

### Technical
- **Retry strategy**: Exponential backoff (1s, 2s, 4s) for both Feedly and OpenRouter 429 errors
- **Token optimization**: Truncate summaries to 500 chars, metadata-only logging
- **Type safety**: Strict interfaces for Article → ScoredArticle → Digest flow
- **Security**: XSS protection in renderer, all AI responses validated as untrusted

## Story Organization

### Active Stories
- **Phase-based**: PHASE-1 to PHASE-7 (migration complete)
- **Foundation**: SETUP-001, TYPES-001 (updated in PHASE-1)
- **Gmail**: GMAIL-001 (OAuth), GMAIL-004 (send) - still valid
- **AI**: AI-002 (OpenRouter client) - still valid
- **Utilities**: LOG-001 (logger) - still valid
- **CI/CD**: CI-001 (pending update for Feedly)

### Archived Stories
- **Location**: `.claude/memory-bank/stories/archived/`
- **Count**: 7 obsolete Perplexity stories
- **Replaced by**: PHASE-1 through PHASE-7

## Notes

- **Migration plan**: `.claude/inputs/plans/claude_code_plan_v2_feedly.md`
- **Original plan**: `.claude/inputs/Plan détaillé newsletter automatisée...md` (archived)
- **Story index**: `.claude/memory-bank/stories/INDEX.md`
- **Phase-based naming**: Stories named by implementation phases for easy traceability
- **Key differentiator**: Score-based filtering (8+/6-7/3-5) + ADHD-friendly digest format with [Score/10] badges
