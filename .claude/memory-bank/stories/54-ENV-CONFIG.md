# Story 54: Environment Configuration

**ID**: 54-ENV-CONFIG
**Type**: Configuration & Deployment
**Status**: 🔄 Update needed
**Effort**: 15 minutes
**Dependencies**: 02-FRESHRSS-PREP, 03-CORE-TYPES

---

## Goal

Update environment variables to support FreshRSS instead of Feedly.

---

## Changes

### File: `.env.example`

**Remove** (Feedly):
```bash
# OLD - DELETE THESE
FEEDLY_API_KEY=...
FEEDLY_JAVA_COLLECTION_ID=...
```

**Add** (FreshRSS):
```bash
# FreshRSS (self-hosted server)
FRESHRSS_BASE_URL=https://rss.your-domain.com
FRESHRSS_TOKEN=your-api-token-here
```

**Keep** (unchanged):
```bash
# OpenRouter API (Claude Haiku)
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Gmail OAuth2
GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxxxx
GMAIL_REFRESH_TOKEN=xxxxx

# Destination email
USER_EMAIL=your-email@example.com
```

---

## Complete `.env.example`

```bash
# ============================================
# FreshRSS Configuration (self-hosted)
# ============================================
FRESHRSS_BASE_URL=https://rss.your-domain.com
FRESHRSS_TOKEN=your-api-token-here

# ============================================
# OpenRouter API (Claude Haiku 3.5)
# ============================================
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# ============================================
# Gmail OAuth2 (output emails)
# ============================================
GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxxxx
GMAIL_REFRESH_TOKEN=xxxxx

# ============================================
# Email Destination
# ============================================
USER_EMAIL=your-email@example.com

# ============================================
# Optional: Stream IDs (if using non-standard labels)
# ============================================
# FRESHRSS_JAVA_STREAM_ID=user/-/label/Java
# FRESHRSS_VUE_STREAM_ID=user/-/label/Vue
```

---

## GitHub Secrets (CI/CD)

Update GitHub repository secrets at: **Settings → Secrets and variables → Actions**

### Remove

- ❌ `FEEDLY_API_KEY`
- ❌ `FEEDLY_JAVA_COLLECTION_ID`

### Add

- ✅ `FRESHRSS_BASE_URL` = `https://rss.your-domain.com`
- ✅ `FRESHRSS_TOKEN` = `your-api-token-from-FreshRSS`

### Keep

- ✅ `OPENROUTER_API_KEY`
- ✅ `GMAIL_CLIENT_ID`
- ✅ `GMAIL_CLIENT_SECRET`
- ✅ `GMAIL_REFRESH_TOKEN`
- ✅ `USER_EMAIL`

---

## Local Development

### Step 1: Create `.env` file

```bash
cd /path/to/newsletter-automation
cp .env.example .env
```

### Step 2: Fill in values

```bash
# From story 02-FRESHRSS-PREP
FRESHRSS_BASE_URL=https://rss.your-domain.com
FRESHRSS_TOKEN=aaaaabbbbbbccccccddddddd

# Keep existing Gmail + OpenRouter values
OPENROUTER_API_KEY=sk-or-v1-xxxxx
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
USER_EMAIL=you@example.com
```

### Step 3: Test

```bash
pnpm start

# Should fetch from FreshRSS, not error about missing Feedly env vars
```

---

## Migration Checklist

- [ ] Remove Feedly env vars from `.env`
- [ ] Add FreshRSS env vars to `.env`
- [ ] Update `.env.example` in repo
- [ ] Update GitHub Secrets:
  - Delete `FEEDLY_API_KEY`
  - Delete `FEEDLY_JAVA_COLLECTION_ID`
  - Add `FRESHRSS_BASE_URL`
  - Add `FRESHRSS_TOKEN`
- [ ] Test locally: `pnpm start`
- [ ] Test workflow trigger (story 61)

---

## Values Reference

| Variable | Source | Example |
|----------|--------|---------|
| `FRESHRSS_BASE_URL` | FreshRSS server URL | `https://rss.example.com` |
| `FRESHRSS_TOKEN` | From FreshRSS API settings (story 02) | `aaa...zzz` |
| `OPENROUTER_API_KEY` | From openrouter.ai dashboard | `sk-or-v1-...` |
| `GMAIL_CLIENT_ID` | From GCP OAuth2 | `xxxxx.apps.googleusercontent.com` |
| `GMAIL_CLIENT_SECRET` | From GCP OAuth2 | `xxxxxx` |
| `GMAIL_REFRESH_TOKEN` | From OAuth2 flow | `xxxxx` |
| `USER_EMAIL` | Your email | `you@example.com` |

---

## Multi-Domain Future

When expanding to multiple domains, optionally add stream IDs:

```bash
FRESHRSS_JAVA_STREAM_ID=user/-/label/Java
FRESHRSS_VUE_STREAM_ID=user/-/label/Vue
FRESHRSS_ANGULAR_STREAM_ID=user/-/label/Angular
```

Then `src/config.ts` can read these, allowing flexible deployment.

---

**Dependencies**: 02-FRESHRSS-PREP (needs FreshRSS values), 03-CORE-TYPES
**Next Stories**:
- 61-GITHUB-ACTIONS (sets GitHub Secrets)
- 51-MAIN-ORCHESTRATION (uses these env vars)
