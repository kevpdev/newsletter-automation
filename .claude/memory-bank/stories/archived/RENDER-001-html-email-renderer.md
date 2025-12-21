# RENDER-001: ADHD-Friendly HTML Email Renderer

**Status**: pending
**Priority**: high
**Effort**: 2h

## Context
**Parent**: Plan Phase 5
**Why**: Generate domain-colored HTML with emoji markers (💡 Impact, 📌 Key Points, 🎯 Action).

## Scope
**Files to create**:
- `src/renderer.ts` - HTML generation

**Key functions**:
- renderOutputEmail(metadata: EmailMetadata, summary: AISummary): string

**HTML structure**:
- Domain header (8px border-left, 20% opacity background)
- Title (h1 with domain color border)
- Impact section (h2 💡)
- 3 Key Points (h2 📌, ul)
- Action section (h2 🎯, yellow background #fffacd, red border-left)

## Acceptance Criteria
- [ ] renderOutputEmail function exported
- [ ] Injects domain color inline (no external CSS)
- [ ] Domain header with metadata (domain, source, date)
- [ ] Title with color border
- [ ] Emoji markers (💡 📌 🎯)
- [ ] Action section: yellow background, red border
- [ ] All HTML valid and inline-styled
- [ ] UTF-8 charset declared
- [ ] Tested with all 8 domain colors

## Dependencies
**Blocks**: GMAIL-004, MAIN-001, TEST-001
**Blocked by**: TYPES-001

## Notes
- ADHD-friendly: visual hierarchy, color cues, emoji anchors
- Inline styles for Gmail compatibility
