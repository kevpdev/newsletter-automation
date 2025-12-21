# MAIN-001: Main Batch Processor Orchestration

**Status**: pending
**Priority**: critical
**Effort**: 2h

## Context
**Parent**: Plan Phase 7
**Why**: Glue all modules together: auth → fetch → extract → AI → render → send → mark processed.

## Scope
**Files to create**:
- `src/main.ts` - Main orchestration

**Key flow**:
- Load config + authenticate Gmail
- Fetch Input/* emails
- For each email: extract → AI summarize → validate → render → send → mark
- Error handling: log and continue (no hard stop on individual failures)
- Exit code 1 on auth failure

## Acceptance Criteria
- [ ] main() function with full pipeline
- [ ] Loads config via loadConfig()
- [ ] Authenticates Gmail (exit on failure)
- [ ] Fetches all Input/* emails
- [ ] Processes each email sequentially
- [ ] Logs start/end of batch
- [ ] Catches individual email errors (continue with next)
- [ ] Logs final count (processed, failed)
- [ ] Exit code 0 on success, 1 on critical failure
- [ ] No hanging promises

## Dependencies
**Blocks**: CI-001, TEST-001
**Blocked by**: GMAIL-002, GMAIL-003, GMAIL-004, AI-001, AI-002, AI-003, RENDER-001, LOG-001

## Notes
- 1-to-1 processing (1 input email = 1 output email)
- No aggregation across emails
