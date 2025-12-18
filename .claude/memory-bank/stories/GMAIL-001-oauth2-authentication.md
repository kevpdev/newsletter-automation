# GMAIL-001: OAuth2 Authentication with GCP

**Status**: pending
**Priority**: high
**Effort**: 1h

## Context
**Parent**: Plan Phase 3.1
**Why**: Authenticate with Gmail API using OAuth2 refresh token to read/send emails.

## Scope
**Files to create**:
- `src/gmail/auth.ts` - OAuth2 client setup

**Key functions**:
- authenticateGmail(config: Config): Promise<gmail_v1.Gmail>

**OAuth2 scopes required**:
- gmail.readonly (read emails)
- gmail.modify (send + modify labels)

## Acceptance Criteria
- [ ] authenticateGmail function exported
- [ ] Uses googleapis OAuth2 client
- [ ] Loads clientId, clientSecret, refreshToken from config
- [ ] Calls getAccessToken() to refresh
- [ ] Returns authenticated gmail_v1.Gmail instance
- [ ] Throws error if auth fails (exit batch)
- [ ] No logging of tokens/secrets

## Dependencies
**Blocks**: GMAIL-002, GMAIL-004
**Blocked by**: SETUP-001, TYPES-001

## Notes
- Redirect URI: "urn:ietf:wg:oauth:2.0:oob"
- Access tokens auto-refresh via refresh_token
