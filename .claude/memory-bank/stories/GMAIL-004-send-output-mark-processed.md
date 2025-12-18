# GMAIL-004: Send to Output/* and Mark as Processed

**Status**: pending
**Priority**: high
**Effort**: 2h

## Context
**Parent**: Plan Phase 3.4
**Why**: Send rendered HTML to Output/* label and mark original email as Processed.

## Scope
**Files to create**:
- `src/gmail/send.ts` - Send + label modification

**Key functions**:
- sendOutputEmail(gmail: gmail_v1.Gmail, output: OutputEmail, config: Config): Promise<string>
- markAsProcessed(gmail: gmail_v1.Gmail, emailId: string, processedLabel: string): Promise<void>

**Gmail API calls**:
- users.messages.send() with MIME HTML
- users.messages.modify() to add labels

## Acceptance Criteria
- [ ] Constructs MIME HTML message with subject
- [ ] Base64 URL-safe encodes message
- [ ] Sends via users.messages.send()
- [ ] Adds Output/{domain} label to sent message
- [ ] Adds Processed label to original email
- [ ] Returns sent message ID
- [ ] Handles send failures gracefully
- [ ] Logs send metadata (messageId, domain)

## Dependencies
**Blocks**: MAIN-001
**Blocked by**: GMAIL-001, TYPES-001, RENDER-001

## Notes
- MIME format: text/html with UTF-8
- Label IDs vs label names (use names for simplicity)
