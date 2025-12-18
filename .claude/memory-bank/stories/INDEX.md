# Newsletter Automation - Stories Index

**Parent Plan**: `.claude/inputs/Plan détaillé newsletter automatisée (Node js + Ty 2c7fe971789a801282bee743ae7c3635.md`

**Total Stories**: 14
**Estimated Effort**: ~18-20 hours

---

## Story List (by Category)

### Foundation
- **SETUP-001**: Project initialization with pnpm + TypeScript - [pending] - 1h
- **TYPES-001**: Core types and domain configuration - [pending] - 1h

### Gmail Integration
- **GMAIL-001**: OAuth2 authentication with GCP - [pending] - 1h
- **GMAIL-002**: Fetch emails from Input/* labels - [pending] - 2h
- **GMAIL-003**: Extract and clean email metadata - [pending] - 1.5h
- **GMAIL-004**: Send to Output/* and mark as Processed - [pending] - 2h

### AI Integration
- **AI-001**: Prompt builder for structured JSON responses - [pending] - 1h
- **AI-002**: OpenRouter API client with retry logic - [pending] - 2h
- **AI-003**: Parse and validate AI responses - [pending] - 1.5h

### Rendering & Utilities
- **RENDER-001**: ADHD-friendly HTML email renderer - [pending] - 2h
- **LOG-001**: Winston logger configuration - [pending] - 1h

### Orchestration
- **MAIN-001**: Main batch processor orchestration - [pending] - 2h

### CI/CD & Quality
- **CI-001**: GitHub Actions workflow setup - [pending] - 1h
- **TEST-001**: Vitest tests for parser and renderer - [pending] - 2h

---

## Dependency Graph

```
SETUP-001 (Foundation - no dependencies)
  │
  ├─> TYPES-001 (Types & Config)
  │    │
  │    ├─> GMAIL-001 (Auth)
  │    │    │
  │    │    ├─> GMAIL-002 (Fetch)
  │    │    │    │
  │    │    │    └─> GMAIL-003 (Extract)
  │    │    │
  │    │    └─> GMAIL-004 (Send + Mark)
  │    │
  │    ├─> AI-001 (Prompt Builder)
  │    │    │
  │    │    └─> AI-002 (OpenRouter Client)
  │    │         │
  │    │         └─> AI-003 (Parser + Validator)
  │    │
  │    ├─> RENDER-001 (HTML Renderer)
  │    │
  │    └─> LOG-001 (Logger)
  │
  └─> MAIN-001 (Orchestration - depends on all above)
       │
       ├─> CI-001 (GitHub Actions - parallel)
       │
       └─> TEST-001 (Tests - parallel)
```

---

## Implementation Order (Suggested)

### Phase 1: Foundation (Sequential)
1. **SETUP-001** - Project initialization
2. **TYPES-001** - Core types and config

### Phase 2: Parallel Streams (After Phase 1)
**Stream A - Gmail**:
3. **GMAIL-001** - Auth (1h)
4. **GMAIL-002** - Fetch (2h)
5. **GMAIL-003** - Extract (1.5h)
6. **GMAIL-004** - Send/Mark (2h)

**Stream B - AI** (parallel with Stream A):
3. **AI-001** - Prompt (1h)
4. **AI-002** - OpenRouter (2h)
5. **AI-003** - Parser (1.5h)

**Stream C - Utilities** (parallel with A & B):
3. **RENDER-001** - HTML Renderer (2h)
4. **LOG-001** - Logger (1h)

### Phase 3: Integration (After Phase 2)
7. **MAIN-001** - Main orchestration (2h)

### Phase 4: Quality & Deployment (Parallel after Phase 3)
8. **CI-001** - GitHub Actions (1h)
9. **TEST-001** - Vitest tests (2h)

---

## Critical Path

**Longest dependency chain** (determines minimum project duration):
```
SETUP-001 (1h)
  → TYPES-001 (1h)
    → GMAIL-001 (1h)
      → GMAIL-002 (2h)
        → GMAIL-003 (1.5h)
          → MAIN-001 (2h)
            → CI-001 or TEST-001 (2h)
```

**Total Critical Path**: ~10.5-11.5 hours (minimum with no parallelization)

**With Parallelization**: ~12-14 hours (3 parallel streams in Phase 2)

---

## Quick Start

To start implementation:

```bash
# Start with foundation
/session-start "Implement SETUP-001"

# After SETUP-001 completion
/session-start "Implement TYPES-001"

# After TYPES-001, parallelize or sequential
/session-start "Implement GMAIL-001"
/session-start "Implement AI-001"
/session-start "Implement RENDER-001 and LOG-001"
```

---

## Story Status Legend

- **pending**: Not started
- **in_progress**: Currently being implemented
- **completed**: Fully implemented and tested
- **blocked**: Waiting on dependencies

---

## Notes

1. **No code examples in stories** - Stories are reference frames, not full specs (token optimization)
2. **BMAD principle** - Each story is self-contained with complete context
3. **Update as you go** - Check off acceptance criteria, add technical notes discovered during implementation
4. **1-to-1 processing** - Each input email → one output email (no aggregation)
5. **Security first** - No secrets in logs, validate all AI responses as untrusted input
6. **ADHD-friendly output** - Emoji markers, visual hierarchy, color cues in HTML

---

## Related Documentation

- **Parent Plan**: `.claude/inputs/Plan détaillé newsletter automatisée (Node js + Ty 2c7fe971789a801282bee743ae7c3635.md`
- **Project Brief**: `.claude/memory-bank/projectbrief.md`
- **Tech Context**: `.claude/memory-bank/techContext.md`
- **Active Context**: `.claude/memory-bank/activeContext.md`

---

**Last Updated**: 2025-12-14
**Created by**: /plan-to-stories command
