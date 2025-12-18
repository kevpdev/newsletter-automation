# AI-001: Prompt Builder for Structured JSON Responses

**Status**: pending
**Priority**: high
**Effort**: 1h

## Context
**Parent**: Plan Phase 4.1
**Why**: Construct AI prompts that force JSON-only output (title, impact, keyPoints[3], action).

## Scope
**Files to create**:
- `src/ai/prompt.ts` - Prompt construction

**Key functions**:
- buildPrompt(metadata: EmailMetadata): string

**Prompt structure**:
- Instruction: "Expert in [DOMAIN], respond ONLY with valid JSON"
- Content: [CLEANED_CONTENT]
- Schema: { title, impact, keyPoints[3], action }
- Constraints: No markdown, no text before/after JSON

## Acceptance Criteria
- [ ] buildPrompt function exported
- [ ] Injects metadata.domain into prompt
- [ ] Injects metadata.contentCleaned
- [ ] Forces JSON-only response (no markdown wrappers)
- [ ] Specifies exact schema structure
- [ ] Includes constraints (title < 50 chars, 3 keyPoints)
- [ ] Returns complete prompt string
- [ ] No secrets in prompt

## Dependencies
**Blocks**: AI-002
**Blocked by**: TYPES-001, GMAIL-003

## Notes
- French or English prompt (match user preference)
- Emphasize "no markdown, pure JSON"
