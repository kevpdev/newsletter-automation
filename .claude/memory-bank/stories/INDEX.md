# Newsletter Automation - Stories Index

**Migration**: Perplexity → Feedly + Claude Haiku (✅ Completed)
**Parent Plan**: `.claude/inputs/plans/claude_code_plan_v2_feedly.md`

**Total Stories**: 13 active + 7 archived
**Effort**: ~6.5 hours actual

---

## Active Stories (Phase-Based)

### Migration Phases (Feedly System)
- **PHASE-1**: Types & Configuration - ✅ Completed - 30 min
- **PHASE-2**: Feedly API Client - ✅ Completed - 1h
- **PHASE-3**: AI Article Scoring - ✅ Completed - 2h
- **PHASE-4**: Score-Based Aggregation - ✅ Completed - 30 min
- **PHASE-5**: HTML Digest Renderer - ✅ Completed - 1h30
- **PHASE-6**: Main Orchestration - ✅ Completed - 1h
- **PHASE-7**: Cleanup & Migration - ✅ Completed - 30 min

### Foundation (Still Valid)
- **SETUP-001**: Project initialization with pnpm + TypeScript - ✅ Completed - 1h
- **TYPES-001**: Core types and domain configuration - ✅ Completed - 1h (updated in PHASE-1)

### Gmail Integration (Still Valid)
- **GMAIL-001**: OAuth2 authentication with GCP - ✅ Completed - 1h
- **GMAIL-004**: Send to Output/* and mark as Processed - ✅ Completed - 2h

### AI Integration (Still Valid)
- **AI-002**: OpenRouter API client with retry logic - ✅ Completed - 2h (updated in PHASE-3)

### Utilities (Still Valid)
- **LOG-001**: Winston logger configuration - ✅ Completed - 1h

### CI/CD (Pending)
- **CI-001**: GitHub Actions workflow setup - ⏳ Pending - 1h
  - TODO: Add `FEEDLY_API_TOKEN` secret
  - TODO: Add `FEEDLY_JAVA_COLLECTION_ID` secret

---

## Archived Stories (Perplexity System)

**Location**: `.claude/memory-bank/stories/archived/`

### Obsolete (Replaced by Feedly)
- **GMAIL-002**: Fetch emails from Input/* labels (replaced by Feedly fetch)
- **GMAIL-003**: Extract and clean email metadata (replaced by Feedly normalization)
- **AI-001**: Prompt builder for structured JSON (replaced by scoring prompts)
- **AI-003**: Parse and validate AI responses (replaced by scoring validation)
- **RENDER-001**: ADHD-friendly HTML email renderer (replaced by digest renderer)
- **MAIN-001**: Main batch processor orchestration (replaced by PHASE-6)
- **TEST-001**: Vitest tests for parser and renderer (replaced by new tests)

---

## Migration Architecture

### Old System (Perplexity)
```
Gmail Input/* → Extract metadata → Perplexity search
  → Parse Markdown → Render HTML → Gmail Output/*
```

### New System (Feedly + Claude Haiku)
```
Feedly Collections (20 articles) → Claude Haiku scoring (1-10)
  → Aggregate by score (Critical/Important/Bonus) → Digest HTML
  → Gmail Output/*
```

---

## Implementation Summary

### Code Changes
- **Created**: 7 new files (Feedly client, scoring, aggregator, tests)
- **Modified**: 6 files (types, config, renderer, index, openrouter, .env)
- **Deleted**: 6 obsolete files (227 lines removed)

### Test Coverage
- **Total tests**: 50/50 passing
- **New tests**: 50 (Feedly: 6, Scoring: 10, Aggregator: 8, Renderer: 26)
- **Deleted tests**: 4 obsolete test files

### Build Status
- ✅ TypeScript compilation: 0 errors
- ✅ All tests passing: 50/50
- ✅ No orphaned imports

---

## Phase Dependencies

```
PHASE-1 (Types & Config)
  │
  ├─> PHASE-2 (Feedly Client)
  │    │
  │    └─> PHASE-3 (AI Scoring)
  │         │
  │         └─> PHASE-4 (Aggregation)
  │              │
  │              └─> PHASE-5 (Renderer)
  │                   │
  │                   └─> PHASE-6 (Orchestration)
  │                        │
  │                        └─> PHASE-7 (Cleanup)
```

---

## Quick Reference

### Start Implementation
```bash
# Review phase specs
cat .claude/memory-bank/stories/PHASE-1-types-config.md

# Build and test
pnpm run build
pnpm test

# Run locally
pnpm start
```

### Phase Content Overview

| Phase | Focus | Files Created | Tests | Lines |
|-------|-------|---------------|-------|-------|
| PHASE-1 | Types & Config | `feedly/types.ts` | 0 | ~40 |
| PHASE-2 | Feedly Client | `feedly/client.ts` | 6 | 118 |
| PHASE-3 | AI Scoring | `ai/scoring.ts`, `ai/scoring-prompts.ts` | 10 | ~133 |
| PHASE-4 | Aggregation | `aggregator.ts` | 8 | 28 |
| PHASE-5 | Renderer | `renderer.ts` (rewrite) | 26 | 135 |
| PHASE-6 | Orchestration | `index.ts` (rewrite) | 0 | 80 |
| PHASE-7 | Cleanup | (deletions) | 0 | -227 |

---

## Next Steps

1. **CI/CD Update** (PHASE-8 equivalent):
   - Update `.github/workflows/run-batch.yml`
   - Add Feedly secrets to GitHub
   - Test workflow with manual trigger

2. **Multi-Domain Expansion**:
   - Add Vue collection (`FEEDLY_VUE_COLLECTION_ID`)
   - Add Angular collection (`FEEDLY_ANGULAR_COLLECTION_ID`)
   - Update orchestration to loop over domains

3. **Production Deployment**:
   - Weekly cron: Mondays 08:00 UTC
   - Monitor logs for scoring failures
   - Adjust scoring criteria based on feedback

---

## Story Status Legend

- ✅ **Completed**: Fully implemented and tested
- ⏳ **Pending**: Not started
- 🔄 **In Progress**: Currently being implemented
- 📦 **Archived**: Obsolete, moved to `archived/`

---

## Notes

1. **Phase-based naming**: Stories named by implementation phases for traceability
2. **Granular specs**: More detailed than migration plan (includes code snippets, test counts)
3. **BMAD principle**: Each story is self-contained with complete context
4. **Security-first**: All AI responses validated, XSS protection in renderer
5. **ADHD-friendly**: Emoji markers, color coding, score badges in output
6. **Token-optimized**: No full code examples in stories (reference actual files)

---

## Related Documentation

- **Migration Plan**: `.claude/inputs/plans/claude_code_plan_v2_feedly.md`
- **Original Plan**: `.claude/inputs/Plan détaillé newsletter automatisée...md` (archived)
- **Project Brief**: `.claude/memory-bank/projectbrief.md`
- **Tech Context**: `.claude/memory-bank/techContext.md`
- **Active Context**: `.claude/memory-bank/activeContext.md`

---

**Last Updated**: 2025-12-21
**Migration Status**: ✅ Completed (Phases 1-7)
**Created by**: Feedly migration session
