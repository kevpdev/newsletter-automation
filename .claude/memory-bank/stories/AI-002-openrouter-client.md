# AI-002: OpenRouter API Client with Retry Logic

**Status**: pending
**Priority**: high
**Effort**: 2h

## Context
**Parent**: Plan Phase 4.2
**Why**: Call OpenRouter API (Llama 3.3 free model) with exponential backoff for rate limits.

## Scope
**Files to create**:
- `src/ai/openrouter.ts` - API client

**Key functions**:
- callOpenRouter(apiKey: string, model: string, prompt: string): Promise<{ json: string; tokensUsed?: number }>

**Retry strategy**:
- 429 (rate limit): exponential backoff (1s, 2s, 4s)
- Max 3 retries
- Log retry attempts

## Acceptance Criteria
- [ ] callOpenRouter function exported
- [ ] Uses Authorization: Bearer {apiKey}
- [ ] Model: meta-llama/llama-3.3-70b-instruct-free
- [ ] Handles 429 with exponential backoff
- [ ] Max 3 retries, then skip email
- [ ] Returns json string + tokensUsed
- [ ] Logs metadata (duration, tokens, status)
- [ ] Never logs full API key
- [ ] Throws on persistent failures

## Dependencies
**Blocks**: AI-003, MAIN-001
**Blocked by**: AI-001

## Notes
- OpenRouter docs: openrouter.ai/docs/quickstart
- Track token usage for cost monitoring
