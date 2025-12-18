# Active Context

Last update: 2025-12-14

## Current Focus
Project initialization - setting up memory-bank structure and preparing for implementation of newsletter automation system per detailed plan.

## Recent Changes
2025-12-14: **Memory-bank initialization**: Created projectbrief.md, techContext.md, activeContext.md with project details from plan.

## Next Steps
1. [ ] Phase 1: Setup pnpm + TypeScript project structure
2. [ ] Phase 2: Define types (InputEmail, EmailMetadata, AISummary, OutputEmail) + config
3. [ ] Phase 3: Implement Gmail API (auth, fetch, extract, send)
4. [ ] Phase 4: Implement AI layer (prompt builder, OpenRouter client, JSON parser)
5. [ ] Phase 5: Implement HTML renderer (domain-colored templates)
6. [ ] Phase 6: Setup Winston logger
7. [ ] Phase 7: Main orchestration (glue all phases together)
8. [ ] Phase 8: GitHub Actions workflow (.github/workflows/run-batch.yml)
9. [ ] Phase 9: Jest tests (parser.test.ts, renderer.test.ts)
10. [ ] Phase 10: Security review (scopes, secrets, error handling)
11. [ ] Phase 11: Documentation (README.md, .env.example)

## Challenges
- Gmail OAuth2 refresh token generation (one-time setup, needs documentation)
- AI response reliability (JSON parsing failures - needs retry + validation)
- OpenRouter rate limits (429 errors - needs exponential backoff)
- Timezone handling for GitHub Actions cron (UTC vs local time)

## Decisions Made
- **1-to-1 flow**: Each input email → one output email (no aggregation across domains)
- **Structured AI output**: Force JSON-only responses (no markdown wrapper) for reliable parsing
- **Domain colors**: Hardcoded in config per domain for visual consistency
- **Processed labels**: Single "Processed" label across all domains (simpler than domain-specific)
- **Error strategy**: Log + continue for individual emails, exit(1) only on auth failures

## Notes
- Plan file location: `.claude/inputs/Plan détaillé newsletter automatisée (Node js + Ty 2c7fe971789a801282bee743ae7c3635.md`
- 11 phases total, sequential implementation recommended
- Key differentiator vs alternative designs: immediate actionability (ADHD-friendly) + zero manual intervention
