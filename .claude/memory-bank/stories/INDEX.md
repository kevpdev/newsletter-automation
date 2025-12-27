# Newsletter Automation - Stories Index

**System**: FreshRSS + Claude Haiku (self-hosted RSS → AI scoring → Email digest)
**Status**: Migration from Feedly to FreshRSS in progress
**Parent Plan**: `.claude/plans/dreamy-questing-flame.md`

---

## Story Map (Numbered by Execution Order)

### Foundation (1xx - Setup & Config)
- **01-PROJECT-SETUP**: Initial project structure (pnpm, TypeScript, strict mode)
  *Status*: ✅ Completed | *Effort*: 1h

- **02-FRESHRSS-PREP**: FreshRSS API setup (OAuth, token, categories)
  *Status*: ⏳ Pending (manual) | *Effort*: 30 min

- **03-CORE-TYPES**: Types and domain configuration (TypeScript interfaces)
  *Status*: 🔄 Update needed | *Files*: `src/types.ts`, `src/config.ts`

### Data Collection (2xx - FreshRSS Integration)
- **21-FRESHRSS-CLIENT**: FreshRSS API client (replace Feedly)
  *Status*: ⏳ Pending | *Files*: Create `src/freshrss/client.ts`, `src/freshrss/types.ts`

### AI Processing (3xx - Scoring & Analysis)
- **31-AI-SCORING**: Claude Haiku scoring (1-10 relevance per article)
  *Status*: ✅ Ready (no changes needed) | *Files*: `src/ai/scoring.ts`, `src/ai/openrouter.ts`

### Output Generation (4xx - Aggregation & Rendering)
- **41-AGGREGATION**: Score-based grouping (Critical/Important/Bonus) + TDAH limit (5 articles)
  *Status*: 🔄 Update needed | *Files*: `src/aggregator.ts`

- **42-HTML-DIGEST**: Digest HTML renderer (inline CSS, responsive)
  *Status*: ✅ Ready (no changes) | *Files*: `src/renderer.ts`

### Execution (5xx - Orchestration & Deployment)
- **51-MAIN-ORCHESTRATION**: Main flow (fetch → score → aggregate → render → send)
  *Status*: 🔄 Update needed | *Files*: `src/index.ts`

- **52-EMAIL-SEND**: Gmail OAuth2 + send with labels
  *Status*: ✅ Ready | *Files*: `src/gmail/auth.ts`, `src/gmail/send.ts`

- **53-LOGGING**: Winston logger setup (console + file)
  *Status*: ✅ Ready | *Files*: `src/logger.ts`

- **54-ENV-CONFIG**: Environment variables (.env, .env.example)
  *Status*: 🔄 Update needed | *Files*: `.env.example`, update secrets

### CI/CD (6xx - Automation)
- **61-GITHUB-ACTIONS**: GitHub Actions workflow + secrets
  *Status*: ⏳ Pending | *Files*: `.github/workflows/run-batch.yml`

### Cleanup & Docs (7xx - Final)
- **71-DELETE-FEEDLY**: Remove Feedly integration
  *Status*: ⏳ Pending | *Files*: Delete `src/feedly/` directory

- **72-UPDATE-DOCS**: Update README.md + project docs
  *Status*: ⏳ Pending | *Files*: `README.md`, `.claude/memory-bank/projectbrief.md`

---

## Implementation Order

### Phase 0: Manual Setup (FreshRSS Server)
```
[ ] 02-FRESHRSS-PREP
    ├─ Enable API in FreshRSS settings
    ├─ Generate API token
    ├─ Create categories (Java, Vue, Angular, etc.)
    └─ Get category stream IDs
```

### Phase 1: TypeScript Implementation
```
[ ] 03-CORE-TYPES       → src/types.ts, src/config.ts
[ ] 21-FRESHRSS-CLIENT  → src/freshrss/client.ts, types.ts
[ ] 41-AGGREGATION      → Modify src/aggregator.ts (add 5-article limit)
[ ] 51-MAIN-ORCHESTRATION → Update src/index.ts (import FreshRSS client)
[ ] 54-ENV-CONFIG       → Update .env.example
```

### Phase 2: Deployment
```
[ ] 71-DELETE-FEEDLY    → Remove src/feedly/ directory
[ ] 54-ENV-CONFIG       → GitHub Secrets (FRESHRSS_BASE_URL, token)
[ ] 61-GITHUB-ACTIONS   → Create workflow
[ ] 72-UPDATE-DOCS      → README.md, project brief
```

---

## File Dependencies

```
src/types.ts (03-CORE-TYPES)
  ↓
src/config.ts (03-CORE-TYPES) + src/freshrss/client.ts (21-FRESHRSS-CLIENT)
  ↓
src/index.ts (51-MAIN-ORCHESTRATION)
  ├─ src/ai/scoring.ts (31-AI-SCORING) [no changes]
  ├─ src/aggregator.ts (41-AGGREGATION) [update]
  ├─ src/renderer.ts (42-HTML-DIGEST) [no changes]
  ├─ src/gmail/ (52-EMAIL-SEND) [no changes]
  └─ src/logger.ts (53-LOGGING) [no changes]
```

---

## Status Summary

| Category | Count | Status |
|----------|-------|--------|
| **Ready** | 6 stories | ✅ (no changes needed) |
| **Updates** | 4 stories | 🔄 (small modifications) |
| **New** | 2 stories | ⏳ (FreshRSS integration) |
| **Manual** | 1 story | ⏳ (server setup) |
| **Cleanup** | 2 stories | ⏳ (final phase) |
| **Total** | **15 stories** | |

**Estimated Time**: 1-2 hours development (plus manual server setup)

---

## Quick Start

```bash
# 1. Review FreshRSS prep (02)
cat .claude/memory-bank/stories/02-FRESHRSS-PREP.md

# 2. Review config/types (03)
cat .claude/memory-bank/stories/03-CORE-TYPES.md

# 3. Review FreshRSS client (21)
cat .claude/memory-bank/stories/21-FRESHRSS-CLIENT.md

# 4. Build & test
pnpm run build
pnpm test

# 5. Test locally
pnpm start
```

---

## Legend

- ✅ **Ready**: No changes needed
- 🔄 **Update**: Small modifications required
- ⏳ **Pending**: Not yet implemented
- 📦 **Archived**: Old implementation (in `/archived/` directory)

---

**Last Updated**: 2025-12-22
**Migration Target**: FreshRSS self-hosted
**Complexity**: Low (architecture already decoupled)
