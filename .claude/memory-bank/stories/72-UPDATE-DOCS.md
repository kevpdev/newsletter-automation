# Story 72: Update Documentation

**ID**: 72-UPDATE-DOCS
**Type**: Documentation & Communication
**Status**: ⏳ Pending
**Effort**: 30 minutes
**Dependencies**: All other stories (72 is last)

---

## Goal

Update project documentation to reflect FreshRSS architecture (replacing Feedly).

---

## Files to Update

### 1. `.claude/memory-bank/projectbrief.md`

**Current** (outdated Gmail Input/* approach):
> Automated newsletter processing system that fetches emails from Gmail Input/* labels, summarizes them with AI (Llama 3.3 via OpenRouter), and sends ADHD-friendly structured summaries to Output/* labels.

**Updated** (FreshRSS approach):
> Automated tech digest system that fetches articles from self-hosted FreshRSS (Google Reader API), scores them with Claude Haiku via OpenRouter, and sends weekly ADHD-friendly email digests grouped by relevance.

---

### 2. `README.md`

#### Title & Intro
```markdown
# Newsletter Automation - Tech Digest

> **Intelligent RSS aggregation & AI scoring** - Fetch articles from FreshRSS, score with Claude Haiku, send curated weekly digests via email.
```

#### Key Features Section
- Replace Feedly references with FreshRSS
- Update collection/label terminology
- Emphasize self-hosted & cost savings

#### Architecture Section
```
FreshRSS Collections (20 articles)
  → Claude Haiku scoring (1-10)
  → Aggregate by score (Critical/Important/Bonus)
  → Email digest with max 5 articles
  → Gmail Output/* labels
```

#### Setup Section
- Replace Feedly API key with FreshRSS token
- Update environment variables
- Add FreshRSS API setup steps

#### Costs/Benefits Section
```
| Aspect | Feedly Enterprise | FreshRSS Self-Hosted |
|--------|-----------------|----------------------|
| Cost | ~$18/month | ~5-10€/month (VPS) |
| Hosting | Cloud (Feedly) | Your VPS |
| Rate Limit | Restrictive | Unlimited |
| Control | Limited | Full |
```

---

### 3. `.claude/memory-bank/activeContext.md` (if exists)

Update current project status and next steps.

---

## Documentation Checklist

- [ ] Update `.claude/memory-bank/projectbrief.md` - architecture & constraints
- [ ] Update `README.md` - features, setup, architecture
- [ ] Verify `.env.example` matches (story 54)
- [ ] Review all code examples use FreshRSS, not Feedly
- [ ] Remove/archive old Feedly documentation

---

## Key Documentation Changes

| Section | Old (Feedly) | New (FreshRSS) |
|---------|--------------|----------------|
| **API** | Feedly API | Google Reader (FreshRSS) |
| **Setup** | Feedly API key | FreshRSS token |
| **Collections** | `feedlyCollectionId` | `freshrssStreamId` |
| **Cost** | ~$18/month | ~5-10€/month |
| **Hosting** | Cloud | Self-hosted VPS |

---

## Template Updates

### Architecture Diagram

```markdown
## Architecture

FreshRSS Server (self-hosted on VPS)
  │
  ├─ Categories: Java, Vue, Angular, etc.
  │  └─ 20 articles per category per week
  │
  ↓ (via Google Reader API)

Node.js Application
  ├─ Fetch articles (FreshRSS client)
  ├─ Score with Claude Haiku (OpenRouter)
  ├─ Aggregate (max 5 articles: 2 critical, 2 important, 1 bonus)
  └─ Render HTML digest

  ↓ (via Gmail API)

Gmail Output/Java, Output/Vue, etc. (inbox)
```

---

## Testing Documentation

```bash
# After story 72, users should be able to:

# 1. Read project brief
cat .claude/memory-bank/projectbrief.md

# 2. Review README
cat README.md

# 3. Follow setup guide
# - Setup FreshRSS (story 02)
# - Create .env file
# - Run `pnpm start`

# 4. Deploy
# - Update GitHub Secrets
# - Trigger workflow
```

---

## Commit Message

```
docs: update documentation for FreshRSS migration

- Replace Feedly references with FreshRSS
- Update project brief & README
- Add FreshRSS setup instructions
- Document cost savings & self-hosted benefits
```

---

## Final Verification

After all stories (01-72) are complete:

```bash
# Build
pnpm run build
# ✓ 0 errors

# Test
pnpm test
# ✓ All tests pass

# Lint (if configured)
pnpm lint
# ✓ No issues

# Grep for old references
grep -r "feedly" . --exclude-dir=node_modules --exclude-dir=.git
# (should return nothing or only archived files)
```

---

## Related Stories

- **02-FRESHRSS-PREP** - Setup info for docs
- **03-CORE-TYPES** - Type documentation
- **21-FRESHRSS-CLIENT** - API details for docs
- **54-ENV-CONFIG** - Environment setup for docs

---

**Dependencies**: All (final story)
**Status**: Last step of FreshRSS migration
**Estimated Total Time**: 1-2 hours (all stories 01-72)
