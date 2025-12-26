# Newsletter Automation System

## What

Automated tech digest system that fetches articles from self-hosted FreshRSS, scores them with Claude Haiku AI via OpenRouter, and sends weekly ADHD-friendly email digests grouped by relevance.

## For whom

Personal use - curating technical newsletters (Java, Vue, Angular, DevOps, AI, Architecture, Security, Frontend) into digestible, actionable summaries.

## Key features

- **RSS aggregation**: Self-hosted FreshRSS server on VPS (no subscription costs)
- **AI scoring**: Claude Haiku scores each article 1-10 for relevance (~0.5s per article)
- **TDAH-friendly limits**: Max 5 articles per digest (2 critical, 2 important, 1 bonus)
- **Automatic digests**: Fetch 20 articles → score all → pick top 5 → send email
- **Domain-specific styling**: Color-coded HTML by topic (Java #FF6B6B, Vue #42B983, etc.)
- **Auto-labeling**: Email sent to `Output/Java`, `Output/Vue`, etc. labels
- **Weekly automation**: GitHub Actions cron every Monday 08:00 UTC

## Constraints

- FreshRSS self-hosted on VPS (requires server management)
- OpenRouter API (free tier: claude-3.5-haiku)
- Gmail API OAuth2 authentication (scopes: readonly + modify)
- GitHub Actions weekly execution
- No personal data sent to AI (content cleaned before scoring)

## Success criteria

- Fetches 20+ articles per domain per week without failures
- Haiku scoring succeeds 95%+ of the time
- Output emails show exactly 5 articles or fewer
- Email is readable and actionable within 30 seconds
- Zero manual intervention required for weekly runs
- ~$1.30/year in OpenRouter costs (Claude Haiku free tier)

## Architecture

```
FreshRSS Server (self-hosted)
    │
    ├─ Collections/Categories (Java, Vue, Angular, etc.)
    │  └─ Feeds added manually (Baeldung, Vue Weekly, etc.)
    │
    ↓ (Google Reader API)

Node.js Application
    ├─ 01. Fetch articles from FreshRSS (20 articles)
    ├─ 02. Score each with Claude Haiku (1-10 relevance)
    ├─ 03. Aggregate: Critical (≥8), Important (6-7), Bonus (3-5)
    ├─ 04. Limit to top 5: 2 critical + 2 important + 1 bonus
    ├─ 05. Render HTML digest (color-coded, emoji-marked)
    └─ 06. Send via Gmail to Output/[Domain] label

    ↓ (Gmail API)

Gmail Inbox → Output/Java, Output/Vue, etc. (weekly)
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Data source** | FreshRSS API | Self-hosted RSS aggregation |
| **AI scoring** | Claude Haiku (OpenRouter) | Fast relevance scoring 1-10 |
| **Email** | Gmail API (OAuth2) | Output delivery + labeling |
| **Orchestration** | Node.js 20 + TypeScript | Application logic |
| **Scheduling** | GitHub Actions | Weekly cron trigger |
| **Logging** | Winston | File + console logging |

## Cost Analysis

| Component | Cost | Notes |
|-----------|------|-------|
| **VPS (FreshRSS)** | ~5-10€/month | OVH VPS 4 vCPU / 8 GB RAM |
| **OpenRouter (Haiku)** | ~$1.30/year | Free tier, 172k tokens/week |
| **Gmail API** | $0 | Free tier (unlimited) |
| **GitHub Actions** | $0 | Free tier (unlimited) |
| **Total** | ~$61-131/year | vs Feedly Enterprise $216/year |

## Migration Notes

**Previous system** (Feedly approach):
- Fetched from Feedly Collections API (Enterprise $18/month)
- Could reach rate limits on paid plan

**Current system** (FreshRSS approach):
- Self-hosted on existing VPS (cost: ~5-10€/month)
- No rate limits (own server)
- Full control over categories & feeds
- Cheaper long-term than Feedly Enterprise

## Stories & Implementation

See `.claude/memory-bank/stories/INDEX.md` for detailed story breakdown:

- **01-PROJECT-SETUP**: Initial pnpm + TypeScript setup
- **02-FRESHRSS-PREP**: FreshRSS API activation (manual server setup)
- **03-CORE-TYPES**: TypeScript types & domain config
- **21-FRESHRSS-CLIENT**: FreshRSS API client (Google Reader format)
- **31-AI-SCORING**: Claude Haiku scoring (no changes from Feedly version)
- **41-AGGREGATION**: Score-based grouping with TDAH limits
- **42-HTML-DIGEST**: Email renderer (no changes)
- **51-MAIN-ORCHESTRATION**: Main flow orchestration
- **52-EMAIL-SEND**: Gmail OAuth2 + send (no changes)
- **53-LOGGING**: Winston logging (no changes)
- **54-ENV-CONFIG**: Environment variables (FreshRSS instead of Feedly)
- **61-GITHUB-ACTIONS**: Workflow setup (FreshRSS secrets)
- **71-DELETE-FEEDLY**: Remove old Feedly integration
- **72-UPDATE-DOCS**: Documentation update

**Total effort**: 1-2 hours development + manual FreshRSS setup

---

**Last Updated**: 2025-12-22
**System Status**: Migration from Feedly to FreshRSS in progress
**Architecture**: FreshRSS + Claude Haiku (self-hosted RSS aggregation)
