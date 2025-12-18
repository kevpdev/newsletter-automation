# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Newsletter automation system that processes technical newsletters via Gmail API + OpenRouter AI. Fetches emails from `Input/*` labels (Java, Angular, DevOps, AI, Architecture, Security, Frontend, Vue), generates ADHD-friendly structured summaries using Llama 3.3, and sends to `Output/*` labels. Runs weekly via GitHub Actions.

**Key constraint**: 1-to-1 processing (each input email → one output email), no aggregation.

## Architecture

**Data flow**: Gmail Input/* → Extract metadata → AI summarization (JSON) → HTML renderer (domain-colored) → Gmail Output/* + mark Processed

**Module structure** (to be implemented):
- `src/types.ts` - Core interfaces (InputEmail, EmailMetadata, AISummary, OutputEmail, DomainConfig)
- `src/config.ts` - Domain configs with colors (#FF6B6B for Java, #DD0031 for Angular, etc.)
- `src/gmail/` - Gmail API layer (auth.ts, fetch.ts, extract.ts, send.ts)
- `src/ai/` - AI layer (prompt.ts, openrouter.ts, parser.ts)
- `src/renderer.ts` - HTML generation with domain-specific styling
- `src/logger.ts` - Winston logging (console + file)
- `src/main.ts` - Orchestration (batch processor)

## Commands

**Package manager**: pnpm (required)

```bash
# Setup
pnpm install

# Build
pnpm run build

# Run
pnpm start

# Tests
pnpm test              # Run all tests
pnpm run test:watch    # Watch mode
```

## AI Integration Rules

**OpenRouter API** (model: `meta-llama/llama-3.3-70b-instruct-free`):
- Prompt MUST force JSON-only output (no markdown wrappers)
- Expected structure: `{ title, impact, keyPoints: [3], action }`
- Parser MUST validate: title < 50 chars, keyPoints.length === 3, all strings non-empty
- Retry strategy: Exponential backoff for 429 (rate limit), max 3 retries
- Never log full AI responses (only metadata: tokens, duration, status)

**Content sanitization before AI**:
- Remove `\r\n` (replace with spaces)
- Strip escaped quotes (`\"`)
- Truncate to ~2000 chars max
- Never send personal data (names, internal email addresses)

## Gmail API

**OAuth2 scopes required**:
- `https://www.googleapis.com/auth/gmail.readonly` - Read emails
- `https://www.googleapis.com/auth/gmail.modify` - Send + modify labels

**Label conventions**:
- Input: `Input/Java`, `Input/Angular`, etc.
- Output: `Output/Java`, `Output/Angular`, etc.
- Processed: `Processed` (single label across all domains)

**Message handling**:
- Query: `label:"Input/Java" is:unread` (or omit is:unread if processing labeled emails)
- Fetch format: `full` (to get HTML + headers)
- After processing: Add `Processed` label to original, send to Output/* with domain label

## HTML Output Format

ADHD-friendly structure (non-negotiable):
- Domain header with color border (8px solid, 20% opacity background)
- Sections: Title (h1 with color border) → Impact (h2 💡) → 3 Key Points (h2 📌, ul) → Action (h2 🎯, yellow box)
- Emoji markers for visual scanning
- Action section: Yellow background (#fffacd), red border-left (#FF6B6B)
- All colors inline (no external CSS)

## Error Handling Strategy

- **Individual email failure**: Log error, continue with next email (no hard stop)
- **Gmail auth failure**: Log + `process.exit(1)` (stop batch)
- **OpenRouter 429**: Exponential backoff (1s, 2s, 4s), max 3 retries, then skip email
- **AI parsing failure**: Log raw JSON, skip email (no fallback)

## GitHub Actions

**Workflow**: `.github/workflows/run-batch.yml`
- Schedule: `cron: "0 8 * * 1"` (Mondays 08:00 UTC)
- Secrets: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, OPENROUTER_API_KEY, USER_EMAIL
- On failure: Upload `logs/` as artifact

## Security Constraints

- Never commit secrets (.env files excluded, use .env.example template)
- Never log API keys, refresh tokens, or full email content
- Validate all AI responses as untrusted input (strict schema validation)
- Content cleaning before AI: Remove PII, truncate length

## Testing Requirements

- **Target coverage**: 80% for business logic (AI parser, HTML renderer)
- **Critical tests**:
  - `tests/parser.test.ts` - Valid JSON parsing, invalid JSON rejection, schema validation
  - `tests/renderer.test.ts` - HTML structure, domain color injection, emoji presence
- **Test data**: Use mock EmailMetadata + AISummary (no real Gmail calls)

## Domain Configuration

Hardcoded in `src/config.ts`:
```typescript
{
  java: { label: "Java", color: "#FF6B6B", ... },
  angular: { label: "Angular", color: "#DD0031", ... },
  devops: { label: "DevOps", color: "#1D63F7", ... },
  ai: { label: "AI", color: "#9D4EDD", ... },
  architecture: { label: "Architecture", color: "#3A86FF", ... },
  security: { label: "Security", color: "#FB5607", ... },
  frontend: { label: "Frontend", color: "#8338EC", ... },
  vue: { label: "Vue", color: "#42B983", ... }
}
```

Adding new domains: Update `defaultDomainConfig` + create Gmail labels manually.

## Implementation Phases

Follow sequential order (dependencies between phases):
1. Setup pnpm + tsconfig (strict mode)
2. Types + config
3. Gmail API (auth → fetch → extract → send)
4. AI layer (prompt → OpenRouter client → parser)
5. HTML renderer
6. Winston logger
7. Main orchestration
8. GitHub Actions workflow
9. Jest tests
10. Security review
11. Documentation (README.md, .env.example)

Detailed plan: `.claude/inputs/Plan détaillé newsletter automatisée (Node js + Ty 2c7fe971789a801282bee743ae7c3635.md`
