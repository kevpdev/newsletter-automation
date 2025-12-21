# AI-003: Parse and Validate AI Responses

**Status**: pending
**Priority**: high
**Effort**: 1.5h

## Context
**Parent**: Plan Phase 4.3
**Why**: Extract JSON from AI response, validate schema (title < 50 chars, 3 keyPoints, etc.).

## Scope
**Files to create**:
- `src/ai/parser.ts` - JSON extraction + validation

**Key functions**:
- parseAISummary(jsonString: string): AISummary
- validateAISummary(summary: AISummary): boolean

**Validation rules**:
- title: non-empty string, < 50 chars
- impact: non-empty string
- keyPoints: array of exactly 3 strings
- action: non-empty string

## Acceptance Criteria
- [ ] parseAISummary extracts first valid JSON object
- [ ] Handles markdown wrappers (```json)
- [ ] validateAISummary checks all fields
- [ ] Throws if validation fails
- [ ] Logs raw JSON on parse failure (no full content)
- [ ] Returns AISummary object
- [ ] No fallback to partial data (fail fast)
- [ ] Tested with valid/invalid JSON

## Dependencies
**Blocks**: MAIN-001
**Blocked by**: AI-002, TYPES-001

## Notes
- Treat AI output as untrusted input
- Strict schema validation (no lenient parsing)
