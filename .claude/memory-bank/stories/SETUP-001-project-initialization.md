# SETUP-001: Project Initialization with pnpm + TypeScript

**Status**: pending
**Priority**: critical
**Effort**: 1h

## Context
**Parent**: Plan Phase 1
**Why**: Foundation for entire newsletter automation system with strict TypeScript, pnpm package management, and test infrastructure.

## Scope
**Files to create/modify**:
- `package.json` - pnpm project manifest with scripts
- `tsconfig.json` - TypeScript strict mode configuration
- `pnpm-lock.yaml` - Lock file (generated)
- `.env.example` - Template for environment variables
- `vitest.config.ts` - Vitest configuration for TypeScript

**Key packages**:
- typescript, @types/node, dotenv, googleapis, nodemailer, winston, axios, cheerio
- vitest, @vitest/ui (dev)

**Scripts**:
- `build`: Compile TypeScript to dist/
- `start`: Run compiled main.ts
- `test`: Run Vitest tests
- `test:watch`: Vitest watch mode

## Acceptance Criteria
- [ ] pnpm initialized with package.json
- [ ] TypeScript strict mode enabled (strict: true, no implicit any)
- [ ] All production dependencies installed
- [ ] All dev dependencies installed
- [ ] Scripts functional (build, start, test)
- [ ] .env.example created with all required variables
- [ ] Vitest configured for TypeScript
- [ ] Build outputs to dist/ directory
- [ ] .gitignore excludes node_modules, dist/, .env, logs/

## Dependencies
**Blocks**: TYPES-001, GMAIL-001, AI-001, LOG-001, RENDER-001
**Blocked by**: None

## Notes
- Use pnpm (required, not npm/yarn)
- Target ES2022, module: NodeNext
- outDir: dist/, rootDir: src/
