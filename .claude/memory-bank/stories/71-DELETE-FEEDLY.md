# Story 71: Delete Feedly Integration

**ID**: 71-DELETE-FEEDLY
**Type**: Cleanup & Migration
**Status**: ⏳ Pending
**Effort**: 10 minutes
**Dependencies**: 21-FRESHRSS-CLIENT, 51-MAIN-ORCHESTRATION

---

## Goal

Remove obsolete Feedly integration code after successful FreshRSS migration.

---

## Files to Delete

### Directory: `src/feedly/`

Remove entire directory:
```bash
rm -rf src/feedly/
```

Contains:
- `src/feedly/client.ts` - Old Feedly API client
- `src/feedly/types.ts` - Old Feedly type definitions

### Optional: Clean up comments

Search for any remaining Feedly references in codebase:

```bash
grep -r "feedly" src/ --ignore-case
```

Should return: **nothing** (after migration complete)

---

## Verification Checklist

- [ ] Delete `src/feedly/` directory
- [ ] Verify `pnpm run build` succeeds (0 errors)
- [ ] Grep for "feedly" - should find nothing
- [ ] Verify imports updated (src/index.ts imports freshrss, not feedly)

---

## Building & Testing

```bash
# Remove directory
rm -rf src/feedly/

# Build
pnpm run build
# Expected: ✓ 0 errors

# Tests
pnpm test
# Expected: All tests pass (no Feedly tests remaining)

# Check for orphaned imports
grep -r "feedly" src/ --ignore-case
# Expected: (no output)
```

---

## Commit Message

```
refactor: remove feedly integration, complete freshrss migration

- Delete src/feedly/ directory (client.ts, types.ts)
- No functional changes (FreshRSS client already in place)
- All imports updated in previous stories
```

---

## Why Delete?

✅ **Clean codebase**: No dead code
✅ **Reduced maintenance**: One fewer integration to support
✅ **Clarity**: Clear FreshRSS dependency
✅ **Security**: No unused credentials

---

**Dependencies**: 21-FRESHRSS-CLIENT (replacement in place), 51-MAIN-ORCHESTRATION (imports updated)
**Next Story**: 72-UPDATE-DOCS (final documentation)
