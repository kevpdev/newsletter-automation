# CI-001: GitHub Actions Workflow Setup

**Status**: pending
**Priority**: medium
**Effort**: 1h

## Context
**Parent**: Plan Phase 8
**Why**: Automate weekly batch runs (Mondays 08:00 UTC) via GitHub Actions with secrets management.

## Scope
**Files to create**:
- `.github/workflows/run-batch.yml` - Workflow config

**Workflow triggers**:
- Schedule: cron "0 8 * * 1" (Mondays 08:00 UTC)
- workflow_dispatch (manual trigger)

**Steps**:
- Checkout, setup Node 20, install pnpm, install deps, build, run batch
- Upload logs/ on failure

**Secrets required**:
- GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
- OPENROUTER_API_KEY, USER_EMAIL

## Acceptance Criteria
- [ ] Workflow file in .github/workflows/
- [ ] Cron schedule: Mondays 08:00 UTC
- [ ] Uses actions/checkout@v4, actions/setup-node@v4
- [ ] Installs pnpm via pnpm/action-setup@v2
- [ ] Runs pnpm install, build, start
- [ ] Passes secrets as env vars
- [ ] Uploads logs/ artifact on failure
- [ ] Manual trigger enabled (workflow_dispatch)
- [ ] README documents required secrets

## Dependencies
**Blocks**: None (parallel with testing)
**Blocked by**: MAIN-001

## Notes
- Adjust cron for timezone (UTC+1/UTC+2)
- Test with workflow_dispatch before relying on cron
