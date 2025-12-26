# Story 02: FreshRSS API Setup

**ID**: 02-FRESHRSS-PREP
**Type**: Manual Setup (Server Configuration)
**Status**: ⏳ Pending
**Effort**: 30 minutes
**Dependencies**: None (server-side)

---

## Goal

Enable FreshRSS API (Google Reader compatible) and prepare categories for integration with Node.js client.

---

## Steps

### Step 1: Enable API in FreshRSS

1. Login to FreshRSS web UI (e.g., `https://rss.your-domain.com`)
2. Settings → Authentication
3. ✅ Check **"Allow API access"**
4. Save

### Step 2: Generate API Token

1. Settings → Profile
2. **API password** section → Generate API password
3. Copy the password (e.g., `superSecretPassword123`)

### Step 3: Get Authentication Token

Run this command to get your permanent auth token:

```bash
curl -X POST "https://rss.your-domain.com/api/greader.php/accounts/ClientLogin" \
  -d "Email=your_freshrss_username&Passwd=superSecretPassword123"
```

**Response** (example):
```
Auth=aaaaabbbbbbccccccddddddd
```

Save this `Auth` value → this is your **FRESHRSS_TOKEN** for `.env`

### Step 4: Create Categories for Each Domain

In FreshRSS web UI:

1. Go to **Manage feeds**
2. Create new **Category**:
   - Name: `Java`
   - (Add relevant Java feeds here: Baeldung, InfoQ, etc.)
3. Repeat for: Vue, Angular, DevOps, AI, Architecture, Security, Frontend

### Step 5: Get Category Stream IDs

Once categories are created, get their IDs:

```bash
curl "https://rss.your-domain.com/api/greader.php/reader/api/0/tag/list?output=json" \
  -H "Authorization: GoogleLogin auth=aaaaabbbbbbccccccddddddd"
```

**Response** (example):
```json
{
  "tags": [
    {
      "id": "user/-/label/Java",
      "categoryId": null
    },
    {
      "id": "user/-/label/Vue",
      "categoryId": null
    }
  ]
}
```

**Mapping for config.ts**:
```
Java  → "user/-/label/Java"
Vue   → "user/-/label/Vue"
etc.
```

---

## Deliverables

- ✅ FreshRSS API enabled
- ✅ API token generated: `FRESHRSS_TOKEN=aaaaabbbbbbccccccddddddd`
- ✅ Categories created (min: Java)
- ✅ Stream IDs mapped: `Java → "user/-/label/Java"`, etc.

---

## Environment Values to Collect

```bash
FRESHRSS_BASE_URL="https://rss.your-domain.com"
FRESHRSS_TOKEN="aaaaabbbbbbccccccddddddd"
```

These go into:
1. Local `.env` file
2. GitHub Secrets (later, in story 54 & 61)

---

## References

- [FreshRSS Documentation](https://freshrss.github.io/)
- [Google Reader API (FreshRSS compatible)](https://github.com/FreshRSS/FreshRSS/blob/master/docs/en/admins/02_Installation.md)

---

**Next Story**: 03-CORE-TYPES (TypeScript configuration)
