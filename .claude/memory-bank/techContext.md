# Tech Stack

## Core
- **Runtime**: Node.js 20 + TypeScript (strict mode)
- **Package manager**: pnpm 8
- **Testing**: Jest + ts-jest
- **Logging**: Winston (console + file transports)
- **Key libraries**: googleapis, axios, cheerio, dotenv

## Architecture
Serverless batch processing via GitHub Actions cron. Monolithic TypeScript script orchestrates:
1. Gmail API (OAuth2) - fetch Input/* emails
2. OpenRouter API - AI summarization (Llama 3.3)
3. HTML renderer - domain-colored templates
4. Gmail API - send to Output/* + mark Processed

Modular structure: `gmail/`, `ai/`, `renderer.ts`, `main.ts` orchestrator.

## Notes
This project follows global CLAUDE.md rules unless specified below.

## Deviations from global rules
- **Git attribution**: No AI attribution in commits/PRs per global rules
- **Testing**: Target 80% coverage for AI parser + renderer (business logic)
- **Security**: Extra validation on AI JSON responses (untrusted external input)

## Why these choices?
- **Llama 3.3 (free)**: Cost-effective vs Claude Sonnet, sufficient for structured summarization
- **GitHub Actions**: Zero infrastructure cost, built-in secrets management, cron scheduling
- **pnpm**: Faster installs, better monorepo support if expanding
- **Winston**: Structured logs critical for debugging async failures in CI
- **Gmail API direct**: No intermediary services, full control over labels/metadata
