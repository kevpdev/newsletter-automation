# LOG-001: Winston Logger Configuration

**Status**: pending
**Priority**: medium
**Effort**: 1h

## Context
**Parent**: Plan Phase 6
**Why**: Centralized logging with console + file outputs, JSON format, configurable levels.

## Scope
**Files to create**:
- `src/logger.ts` - Winston logger instance

**Transports**:
- Console (all levels)
- File: logs/error.log (error level only)
- File: logs/combined.log (all levels)

**Log levels**:
- debug, info, warn, error
- Configurable via LOG_LEVEL env var

## Acceptance Criteria
- [ ] Logger instance exported as default
- [ ] Winston configured with timestamp + JSON format
- [ ] Console transport enabled
- [ ] Error file transport (logs/error.log)
- [ ] Combined file transport (logs/combined.log)
- [ ] LOG_LEVEL env var support
- [ ] Logs directory created on first run
- [ ] No secrets logged (API keys, tokens)
- [ ] Metadata logging (domain, emailId, tokens)

## Dependencies
**Blocks**: MAIN-001
**Blocked by**: SETUP-001

## Notes
- .gitignore logs/ directory
- GitHub Actions: upload logs/ on failure
