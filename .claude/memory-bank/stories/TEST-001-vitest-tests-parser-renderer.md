# TEST-001: Vitest Tests for Parser and Renderer

**Status**: pending
**Priority**: medium
**Effort**: 2h

## Context
**Parent**: Plan Phase 9
**Why**: 80% coverage on business logic (AI parser, HTML renderer) with unit tests.

## Scope
**Files to create**:
- `tests/parser.test.ts` - AI parser tests
- `tests/renderer.test.ts` - HTML renderer tests

**Test scenarios**:
- Parser: valid JSON, invalid JSON, missing fields, schema violations
- Renderer: HTML structure, domain colors, emoji presence, action section styling

## Acceptance Criteria
- [ ] parser.test.ts with 5+ test cases
- [ ] renderer.test.ts with 5+ test cases
- [ ] All tests pass (pnpm test)
- [ ] Coverage ≥ 80% for src/ai/parser.ts
- [ ] Coverage ≥ 80% for src/renderer.ts
- [ ] Uses mock EmailMetadata + AISummary (no real Gmail)
- [ ] Tests validate strict schema (title < 50 chars, etc.)
- [ ] Tests check HTML contains domain color
- [ ] Watch mode functional (pnpm run test:watch)

## Dependencies
**Blocks**: None
**Blocked by**: MAIN-001, AI-003, RENDER-001

## Notes
- No integration tests (Gmail, OpenRouter) in this story
- Focus on pure functions (parser, renderer)
