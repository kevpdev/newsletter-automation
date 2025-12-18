# Active Context

Last update: 2025-12-18 22:53

## Current Focus
Gmail integration complete and tested with real data. Ready to implement AI layer (OpenRouter + Llama 3.3).

## Recent Changes
[2025-12-18 22:53]: **OAuth2 scope conflict resolution**: Fixed metadata vs readonly conflict preventing Gmail API access. Created auth helper scripts (auth:generate, auth:check). Modified fetch to use labelIds instead of q parameter. Successfully tested with 11 real Java Weekly emails (src/gmail/auth.ts, src/gmail/fetch.ts, src/index.ts, scripts/generate-refresh-token.ts, scripts/check-token-scopes.ts)

[2025-12-14]: **Gmail and AI layers with tests**: Implemented OAuth2 auth, email fetch/extract/send, AI prompt builder. Created 32 passing unit tests across all modules (src/gmail/*, src/ai/prompt.ts, tests/**)

[2025-12-14]: **Memory-bank initialization**: Created projectbrief.md, techContext.md, activeContext.md with project details from plan

## Next Steps
1. [ ] STORY-09: Implement OpenRouter API client with retry logic (meta-llama/llama-3.3-70b-instruct-free)
2. [ ] STORY-10: Implement AI response parser with schema validation
3. [ ] STORY-11: Implement HTML renderer with domain-specific styling
4. [ ] STORY-12: Implement main orchestration (batch processor loop)
5. [ ] STORY-13-14: Write tests for AI parser and HTML renderer
6. [ ] STORY-15: Create GitHub Actions workflow
7. [ ] STORY-16: Security review
8. [ ] STORY-17: Documentation (README.md)

## Challenges
✅ **RESOLVED - OAuth2 scope conflict**: gmail.metadata was interfering with gmail.readonly, blocking format:full. Solution: regenerate refresh tokens WITHOUT metadata scope (only readonly, modify, send)

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
