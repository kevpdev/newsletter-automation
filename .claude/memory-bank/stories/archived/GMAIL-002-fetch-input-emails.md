# GMAIL-002: Fetch Emails from Input/* Labels

**Status**: pending
**Priority**: high
**Effort**: 2h

## Context
**Parent**: Plan Phase 3.2
**Why**: Retrieve unread emails from Input/Java, Input/Angular, etc. labels for processing.

## Scope
**Files to create**:
- `src/gmail/fetch.ts` - Fetch logic

**Key functions**:
- fetchInputEmails(gmail: gmail_v1.Gmail, inputLabels: string[], maxPerLabel: number): Promise<InputEmail[]>

**Gmail API calls**:
- users.messages.list({ q: 'label:"Input/Java" is:unread' })
- users.messages.get({ format: "full" }) for each message

## Acceptance Criteria
- [ ] Fetches from all provided inputLabels
- [ ] Queries for is:unread (or skip if processing labeled emails)
- [ ] Limits to maxPerLabel per domain
- [ ] Parses headers: From, Subject, Date
- [ ] Extracts HTML content (or plaintext fallback)
- [ ] Returns array of InputEmail objects
- [ ] Handles no emails gracefully (empty array)
- [ ] Logs fetch metadata (count, labels)

## Dependencies
**Blocks**: GMAIL-003, MAIN-001
**Blocked by**: GMAIL-001, TYPES-001

## Notes
- format: "full" needed for HTML + headers
- Handle base64-encoded content parts
