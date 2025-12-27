# Tech Stack

## Core Infrastructure
- **Runtime**: Node.js 20 + TypeScript 5+ (strict mode)
- **Package manager**: pnpm 8+
- **Testing**: Jest + ts-jest
- **Logging**: Winston (console + file transports)
- **Key libraries**: googleapis, axios, dotenv, openrouter-api-client

## Data Flow Architecture
Batch processing via GitHub Actions cron. Orchestrates weekly digest pipeline:

```
FreshRSS (self-hosted)
  → Google Reader API integration
  → Fetch 50 articles per domain (14-day window)
  ↓
Gemini Flash 2.5 scoring (OpenRouter API)
  → JSON: {score: 1-10, reason: string}
  ↓
Aggregation & Filtering
  → Critical (8+), Important (6-7), Bonus (3-5)
  → Skip (1-2)
  ↓
HTML Digest Renderer
  → Domain-colored templates
  → ADHD-friendly format: [Score/10] Title + link/reason
  ↓
Gmail API (OAuth2)
  → Send to Output/[Domain] label
  → One email per domain per week
```

## Modules

| Module | Purpose | Key Files |
|--------|---------|-----------|
| **FreshRSS** | RSS article fetching | `src/freshrss/client.ts`, `types.ts` |
| **AI Scoring** | LLM-based relevance scoring | `src/ai/scoring.ts`, `scoring-prompts.ts` |
| **Aggregation** | Score-based filtering & grouping | `src/aggregator.ts` |
| **Rendering** | HTML email generation | `src/renderer.ts` |
| **Gmail** | OAuth2 + email sending | `src/gmail/auth.ts`, `send.ts` |
| **Logging** | Winston structured logging | `src/logger.ts` |
| **Config** | Domain configuration | `src/config.ts` |

## Key Technology Choices

### Data Source: FreshRSS (Self-Hosted)
- **Why**: Full API control, no rate limits, cost-effective (~5-10€/month on existing VPS)
- **Alternative rejected**: Feedly Enterprise ($18/month) hit rate limits despite plan upgrade
- **Integration**: Google Reader API compatible (REST endpoints)
- **Window**: 14-day rolling window for each domain category

### AI Model: Gemini Flash 2.5 (OpenRouter)
- **Why**: Best cost/performance (100x faster than Haiku, 70% cheaper)
- **Alternatives evaluated**: Claude 3.5 Haiku, Llama 3.3, Gemini 1.5
- **Cost**: ~$1/month for ~50 articles × 8 domains × 4 weeks
- **Response format**: JSON-native (no parsing overhead)
- **Model spec**: `google/gemini-2.5-flash` via OpenRouter

### Execution: GitHub Actions Cron
- **Schedule**: Mondays 08:00 UTC (weekly)
- **Why**: Zero infrastructure, built-in secrets, artifact uploads for logs
- **Parallelism**: Sequential domain processing (avoid FreshRSS thundering herd)
- **Error handling**: Graceful degradation (1 domain failure doesn't stop others)

## Notes
This project follows global CLAUDE.md rules unless specified below.

## Deviations from global rules
- **Git attribution**: No AI attribution per global rules
- **Testing**: Target 80% for business logic (AI, aggregation, renderer)
- **Security**: Strict AI response validation (untrusted external input)

## Design Principles Applied
- **ADHD-friendly**: Color-coded tiers, emoji markers, [Score/10] badges for quick scanning
- **Type safety**: Strict interfaces, no implicit `any`
- **Fault tolerance**: Exponential backoff (1s, 2s, 4s) for transient API errors
- **Observability**: Structured logging with domain context throughout
