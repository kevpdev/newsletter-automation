# GMAIL-003: Extract and Clean Email Metadata

**Status**: pending
**Priority**: high
**Effort**: 1.5h

## Context
**Parent**: Plan Phase 3.3
**Why**: Extract domain from label, retrieve color, sanitize content for AI (remove \r\n, escaped quotes, PII).

## Scope
**Files to create**:
- `src/gmail/extract.ts` - Metadata extraction + sanitization

**Key functions**:
- extractMetadata(email: InputEmail, domainConfig: Record<string, DomainConfig>): Promise<EmailMetadata>

**Sanitization rules**:
- Remove \r\n (replace with spaces)
- Strip escaped quotes (\")
- Truncate to ~2000 chars max
- Remove personal data (names, internal emails)

## Acceptance Criteria
- [ ] Extracts domain from email.label (Input/Java → "Java")
- [ ] Retrieves domainColor from domainConfig
- [ ] Cleans contentCleaned field
- [ ] Truncates long content
- [ ] Returns EmailMetadata object
- [ ] Handles missing domain config (error)
- [ ] No PII leaked to AI
- [ ] Logs extraction metadata (domain, length)

## Dependencies
**Blocks**: MAIN-001, AI-001
**Blocked by**: GMAIL-002, TYPES-001

## Notes
- Case-insensitive domain matching
- Preserve enough context for AI (don't over-truncate)
