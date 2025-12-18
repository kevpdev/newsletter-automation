# TYPES-001: Core Types and Domain Configuration

**Status**: pending
**Priority**: critical
**Effort**: 1h

## Context
**Parent**: Plan Phase 2
**Why**: Define all TypeScript interfaces and domain configurations (Java, Angular, DevOps, etc.) with strict typing for email processing pipeline.

## Scope
**Files to create**:
- `src/types.ts` - All core interfaces
- `src/config.ts` - Domain configs + env loader

**Key interfaces**:
- InputEmail (id, label, subject, from, date, htmlContent, plainContent)
- EmailMetadata (domain, domainColor, subject, from, date, contentCleaned)
- AISummary (title, impact, keyPoints[3], action)
- OutputEmail (domain, color, subject, htmlContent, to)
- DomainConfig (label, color, inputLabel, outputLabel, processedLabel)
- Config (gmail, openrouter, domains, userEmail, logging)

**Domain configs** (hardcoded):
- java: #FF6B6B, angular: #DD0031, devops: #1D63F7, ai: #9D4EDD
- architecture: #3A86FF, security: #FB5607, frontend: #8338EC, vue: #42B983

## Acceptance Criteria
- [ ] All interfaces exported from src/types.ts
- [ ] No 'any' types (use 'unknown' if needed)
- [ ] keyPoints typed as [string, string, string] (exactly 3)
- [ ] defaultDomainConfig has all 8 domains
- [ ] loadConfig() function reads from process.env
- [ ] Config validates all required env vars present
- [ ] Domain colors are hex strings
- [ ] Input/Output/Processed labels follow convention

## Dependencies
**Blocks**: GMAIL-002, GMAIL-003, AI-001, AI-003, RENDER-001
**Blocked by**: SETUP-001

## Notes
- Strict null checks enforced
- Explicit return types on all exported functions
