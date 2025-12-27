# Newsletter Automation - Tech Digest

> **Agrégation intelligente de tech news via FreshRSS** - Collecte d'articles via FreshRSS self-hosted (50/semaine, 7 jours), scoring avec Gemini Flash 2.5, génération de digests ADHD-friendly (5-10 articles), envoi par email chaque semaine.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-8.x-orange)](https://pnpm.io/)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

---

## 📋 Table des matières

- [Aperçu](#-aperçu)
- [Architecture](#-architecture)
- [Fonctionnalités](#-fonctionnalités)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Automatisation GitHub Actions](#-automatisation-github-actions)
- [Structure du projet](#-structure-du-projet)
- [Extension multi-domaines](#-extension-multi-domaines)
- [Dépannage](#-dépannage)

---

## 🎯 Aperçu

**Newsletter Automation** collecte les articles pertinents depuis votre serveur FreshRSS self-hosted (50 articles, 7 derniers jours), les score automatiquement via Gemini Flash 2.5, et génère un digest hebdomadaire optimisé (5-10 articles) organisé par priorité avec design ADHD-friendly.

### Flow de données

```
┌─────────────────┐
│  GitHub Actions │  Lundi 08:00 UTC
│  (cron weekly)  │
└────────┬────────┘
         │
         v
┌─────────────────────────────────────────────────────┐
│  1. Récupération FreshRSS (Google Reader API)      │
│     - Fetch 50 articles par catégorie              │
│     - Filtre: derniers 7 jours (tous statuts)     │
│     - Title, summary, URL, date publication        │
└────────┬────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────┐
│  2. Scoring AI (Gemini Flash 2.5)                 │
│     - Évalue pertinence (1-10) pour domaine        │
│     - Rapide: ~0.2s/article (cost-effective)      │
└────────┬────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────┐
│  3. Agrégation Adaptative par Score                │
│     - 🔴 Critical: TOUS (score ≥ 8)              │
│     - 🟠 Important: TOUS (score 6-7)             │
│     - 🟡 Bonus: jusqu'à MAX 10 articles           │
│     - Total digest: 5-10 articles                  │
│     - Stratégie: Remplit jusqu'au max              │
└────────┬────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────┐
│  4. Render HTML Digest ADHD-Friendly                │
│     - Couleur domaine (#FF6B6B Java, #42B983 Vue)  │
│     - Sections critiques → importantes → bonus      │
│     - Liens cliquables vers articles originaux      │
└────────┬────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────┐
│  5. Envoi Email Hebdomadaire                        │
│     - Subject: [Java] Tech Digest - Week X, 2025    │
│     - Label: Output/Java                            │
└─────────────────────────────────────────────────────┘
```

### Avantages FreshRSS Self-Hosted

✅ **Pas de coûts récurrents** - Serveur VPS déjà disponible (~5-10€/mois)
✅ **Pas de rate limits** - API locale, contrôle total
✅ **Compatibilité Google Reader** - API standard, bien documentée
✅ **Smart scoring** - Contexte domaine via Gemini Flash 2.5 (cost-effective)
✅ **Digest adaptatif** - 5-10 articles (remplit jusqu'au max, ADHD-friendly)

### Comparaison Feedly vs FreshRSS

| Aspect | Feedly Enterprise | FreshRSS (Solution actuelle) |
|--------|------------------|------------------------------|
| **Coût** | ~$18/mois ($216/an) | ~5-10€/mois VPS (~$60-131/an) |
| **Hébergement** | Cloud Feedly | VPS self-hosted |
| **Rate Limits** | Restrictifs | Aucun (serveur perso) |
| **Contrôle** | Limité | Total |
| **API** | Propriétaire | Google Reader (standard) |

---

## 🏗️ Architecture

### Approche intelligente et self-hosted

**Flow principal** : FreshRSS (self-hosted) → Claude Haiku Scoring → Agrégation (max 5) → HTML Digest → Email

**Design** : Un digest par catégorie FreshRSS, articles groupés par score avec limites ADHD-friendly

### Stack technique

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| **Runtime** | Node.js 20 + TypeScript 5 | Exécution typée strict mode |
| **FreshRSS API** | Google Reader API (self-hosted) | Récupération articles par catégorie |
| **AI Scoring** | Claude Haiku (OpenRouter) | Scoring rapide 1-10/article |
| **Email** | Gmail API (OAuth2) | Envoi digest + label |
| **Automation** | GitHub Actions | Exécution hebdomadaire (cron) |
| **Logging** | Winston | Console + fichiers rotatifs |

### Composants clés

```
src/
├── types.ts              # Interfaces (FreshRSSItem, Article, ScoredArticle, Digest, OutputEmail)
├── config.ts             # Domaines + FreshRSS streamId + couleurs
├── freshrss/
│   ├── client.ts         # Client FreshRSS API (fetch articles Google Reader)
│   └── types.ts          # Types FreshRSS
├── ai/
│   ├── scoring.ts        # Scoring Claude Haiku (batch par domaine)
│   ├── scoring-prompts.ts # Prompts spécifiques domaines
│   └── openrouter.ts     # Client OpenRouter + retry logic
├── aggregator.ts         # Agrégation par score avec limites (max 5 articles)
├── renderer.ts           # HTML digest ADHD-friendly (sections score, couleurs domaine)
├── gmail/
│   ├── auth.ts           # OAuth2 Gmail
│   └── send.ts           # Envoi email + label Output/*
├── logger.ts             # Winston (console + logs/)
└── index.ts              # Orchestration principale (fetch → score → aggregate → render → send)
```

---

## ✨ Fonctionnalités

### Collecte intelligente

- ✅ **FreshRSS Self-Hosted** - Serveur RSS personnel (VPS)
- ✅ **API Google Reader** - Standard, stable, bien documenté
- ✅ **Récupération articles** - Title, summary, URL, date (fetch 20 articles/semaine)
- ✅ **Articles non-lus** - Filtre automatique `xt=user/-/state/com.google/read`
- ✅ **Pas de rate limits** - Serveur personnel

### Scoring intelligent

- 🤖 **Claude Haiku** - Évaluation pertinence 1-10 par article (~0.5s/article)
- 📊 **Contexte domaine** - Prompts spécifiques Java/Vue/Angular/etc.
- 🔄 **Retry logic** - Backoff exponentiel sur rate limit (429)
- ⚡ **Batch efficient** - 20 articles scorés en ~10 secondes

### Digest ADHD-friendly

- 🎨 **Couleurs domaine** - 8 couleurs distinctes (Java #FF6B6B, Vue #42B983)
- 🔴 **Section Critical** - Max 2 articles (score ≥ 8)
- 🟠 **Section Important** - Max 2 articles (score 6-7)
- 🟡 **Section Bonus** - Max 1 article (score 3-5)
- 🎯 **Limite totale** - Max 5 articles par digest (évite surcharge)
- 🔗 **Liens cliquables** - URLs vers articles originaux
- 📱 **Responsive** - Inline styles tous clients email

### Sécurité & Qualité

- 🔒 **Validation scoring** - Score 1-10 uniquement, rejet si invalide
- 🔐 **OAuth2 Gmail** - Tokens refresh automatique
- 🚫 **No secrets** - Variables d'environnement uniquement
- 📝 **Logging complet** - Winston console + logs/ rotatifs

---

## 📦 Prérequis

- **Node.js** ≥ 20.x
- **pnpm** ≥ 8.x
- **Serveur FreshRSS** self-hosted (VPS avec Docker recommandé)
- **Compte Google** avec Gmail API activée
- **Compte OpenRouter** avec API key

---

## 🚀 Installation

### 1. Cloner le repository

```bash
git clone <repo-url>
cd newsletter-automation
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configurer l'environnement

Copier `.env.example` → `.env`:

```bash
cp .env.example .env
```

---

## ⚙️ Configuration

### Variables d'environnement

Éditer `.env`:

```bash
# FreshRSS (self-hosted server)
FRESHRSS_BASE_URL=https://rss.your-domain.com
FRESHRSS_TOKEN=your-api-token-here

# OpenRouter API (Claude Haiku scoring)
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Gmail OAuth2 (envoi digests)
GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxxxx
GMAIL_REFRESH_TOKEN=xxxxx

# Email utilisateur (destinataire digests)
USER_EMAIL=votre-email@example.com
```

### Configurer FreshRSS

**1. Installation FreshRSS** (si pas déjà fait):

```bash
# Via Docker (recommandé)
docker run -d \
  --name freshrss \
  -p 8080:80 \
  -v freshrss_data:/var/www/FreshRSS/data \
  freshrss/freshrss

# Accès: http://your-vps-ip:8080
# Configuration initiale: créer compte admin
```

**2. Activer API Google Reader**:
1. FreshRSS → Paramètres → API
2. Activer "API Google Reader"
3. Générer token → Copier pour `FRESHRSS_TOKEN`

**3. Créer catégories** (labels):
1. FreshRSS → Flux → Catégories → Ajouter
2. Créer: `Java`, `Vue`, `Angular`, etc.
3. Ajouter flux RSS dans chaque catégorie

**4. Obtenir Stream IDs**:
- Format: `user/-/label/Java`
- Configuré automatiquement dans `src/config.ts`

### Obtenir les credentials Gmail

1. **Activer Gmail API**
   - Console Google Cloud: https://console.cloud.google.com
   - APIs & Services → Enable APIs → Gmail API

2. **Créer OAuth2 credentials**
   - Credentials → Create OAuth Client ID → Desktop app
   - Télécharger JSON → Extraire `client_id` et `client_secret`

3. **Générer refresh token**
   ```bash
   # Utiliser OAuth2 Playground ou script custom
   # Scopes requis:
   # - https://www.googleapis.com/auth/gmail.readonly
   # - https://www.googleapis.com/auth/gmail.modify
   ```

### Obtenir OpenRouter API Key

1. S'inscrire sur https://openrouter.ai
2. Dashboard → API Keys → Create Key
3. Copier la clé `sk-or-v1-xxxxx` (utilise Claude Haiku)

### Configurer Domaines

**Dans `src/config.ts`** :
```typescript
export const DOMAINS: DomainConfig[] = [
  {
    label: 'Java',
    color: '#FF6B6B',
    freshrssStreamId: process.env.FRESHRSS_JAVA_STREAM_ID || 'user/-/label/Java',
    outputLabel: 'Output/Java'
  },
  // ... autres domaines (commentés pour MVP)
];
```

### Créer les labels Gmail

Manuellement dans Gmail web, créer **Output/** labels pour chaque domaine :

**Labels Output (digests)** :
- `Output/Java` (couleur #FF6B6B recommandée)
- `Output/Vue` (couleur #42B983 recommandée)
- `Output/Angular` (couleur #DD0031 recommandée)
- `Output/DevOps` (couleur #1D63F7 recommandée)
- `Output/AI` (couleur #9D4EDD recommandée)
- `Output/Architecture` (couleur #3A86FF recommandée)
- `Output/Security` (couleur #FB5607 recommandée)
- `Output/Frontend` (couleur #8338EC recommandée)

---

## 💻 Utilisation

### Développement local

```bash
# Build TypeScript
pnpm run build

# Exécuter une fois
pnpm start

# Watch mode (rebuild auto)
pnpm run dev
```

### Tests

```bash
# Tous les tests
pnpm test

# Watch mode
pnpm run test:watch

# UI mode
pnpm run test:ui
```

### Logs

Les logs sont écrits dans:
- **Console** - Niveau INFO
- **Fichier** - `logs/newsletter-automation.log` (rotation quotidienne)

Format:
```
2025-01-15 10:30:45 [info]: 🚀 Starting Tech Digest Batch (FreshRSS + Claude Haiku)
2025-01-15 10:30:46 [info]: 📁 Domain: Java
2025-01-15 10:30:47 [info]: 📡 Fetching articles from FreshRSS...
2025-01-15 10:30:48 [info]: ✓ Fetched 20 articles
2025-01-15 10:30:49 [info]: 🤖 Scoring articles with Claude Haiku...
2025-01-15 10:30:59 [info]: ✓ Scored 20 articles
2025-01-15 10:31:00 [info]: 📊 Digest breakdown: 2 critical, 2 important, 1 bonus (total: 5/20)
2025-01-15 10:31:01 [info]: 🎨 Rendering HTML digest...
2025-01-15 10:31:02 [info]: 📧 Sending tech digest email...
2025-01-15 10:31:04 [info]: ============================================================
2025-01-15 10:31:04 [info]: ✅ Tech Digest completed in 19.2s
2025-01-15 10:31:04 [info]: ============================================================
```

---

## 🤖 Automatisation GitHub Actions

### Workflow hebdomadaire

**Fichier**: `.github/workflows/run-batch.yml`

**Schedule**: Lundi 08:00 UTC (`cron: '0 8 * * 1'`)

**Steps**:
1. Checkout repository
2. Setup pnpm + Node.js 20
3. Install dependencies (`--frozen-lockfile`)
4. Build TypeScript
5. Run `pnpm start` (digest pour domaine Java MVP)
6. Upload logs on failure (artifact 7 jours)

**Flow d'exécution** :
1. **FreshRSS API** : Fetch 20 articles non-lus catégorie Java
2. **Claude Haiku** : Score 1-10 chaque article (~0.5s/article = 10s total)
3. **Agrégation** : Sélectionner top 5 (2 critical, 2 important, 1 bonus)
4. **Digest HTML** : Render sections avec couleur Java, liens articles
5. **Email** : Envoyer à USER_EMAIL avec label Output/Java

### Secrets GitHub

Configurer dans **Settings → Secrets and variables → Actions**:

| Secret | Exemple | Description |
|--------|---------|-------------|
| `FRESHRSS_BASE_URL` | `https://rss.your-domain.com` | URL serveur FreshRSS |
| `FRESHRSS_TOKEN` | `xxxxxxxxxxxxxxx` | Token API FreshRSS |
| `OPENROUTER_API_KEY` | `sk-or-v1-xxxxx` | Clé API OpenRouter (Claude Haiku) |
| `GMAIL_CLIENT_ID` | `xxxxx.apps.googleusercontent.com` | OAuth2 Client ID |
| `GMAIL_CLIENT_SECRET` | `xxxxx` | OAuth2 Client Secret |
| `GMAIL_REFRESH_TOKEN` | `xxxxx` | OAuth2 Refresh Token |
| `USER_EMAIL` | `user@example.com` | Email destinataire digests |

### Trigger manuel

```bash
# Via interface GitHub
Actions → Java Tech Watch → Run workflow

# Via GitHub CLI
gh workflow run run-batch.yml
```

---

## 📁 Structure du projet

```
newsletter-automation/
├── .github/
│   └── workflows/
│       └── run-batch.yml      # GitHub Actions (cron weekly)
├── src/
│   ├── types.ts               # Interfaces (FreshRSSItem, Article, ScoredArticle, Digest)
│   ├── config.ts              # Domaines + FreshRSS streamId + couleurs
│   ├── freshrss/
│   │   ├── client.ts          # Client FreshRSS (Google Reader API)
│   │   └── types.ts           # Types FreshRSS (FreshRSSItem, FreshRSSResponse)
│   ├── ai/
│   │   ├── scoring.ts         # Batch scoring Claude Haiku
│   │   ├── scoring-prompts.ts # Prompts spécifiques domaines
│   │   ├── openrouter.ts      # Client OpenRouter + retry logic
│   │   └── prompts/           # Prompts par domaine
│   ├── aggregator.ts          # Agrégation par score avec limites (max 5)
│   ├── renderer.ts            # HTML digest ADHD-friendly
│   ├── gmail/
│   │   ├── auth.ts            # OAuth2 Gmail
│   │   └── send.ts            # Envoi digest + label Output/*
│   ├── logger.ts              # Winston (console + logs/)
│   └── index.ts               # Orchestration (fetch → score → aggregate → render → send)
├── tests/                     # Tests Vitest
├── logs/                      # Logs Winston (gitignored)
├── .env.example               # Template variables env
├── package.json
├── tsconfig.json              # Config TypeScript strict mode
└── README.md
```

---

## 🔄 Extension multi-domaines

L'architecture supporte **8 domaines** configurés dans `src/config.ts`. **MVP actuel**: Java uniquement.

### Domaines disponibles

| Domaine | Couleur | FreshRSS Stream | Scoring Prompt |
|---------|---------|-----------------|-----------------|
| **Java** | #FF6B6B | `user/-/label/Java` | Java MVP actif |
| **Vue** | #42B983 | `user/-/label/Vue` | Prêt |
| **Angular** | #DD0031 | `user/-/label/Angular` | Prêt |
| **DevOps** | #1D63F7 | `user/-/label/DevOps` | Prêt |
| **AI** | #9D4EDD | `user/-/label/AI` | Prêt |
| **Architecture** | #3A86FF | `user/-/label/Architecture` | Prêt |
| **Security** | #FB5607 | `user/-/label/Security` | Prêt |
| **Frontend** | #8338EC | `user/-/label/Frontend` | Prêt |

### Activer un nouveau domaine

**1. Créer catégorie FreshRSS**:
- FreshRSS → Flux → Catégories → Ajouter "Vue"
- Ajouter flux RSS Vue (Vue Weekly, etc.)

**2. Décommenter config** dans `src/config.ts`:

```typescript
export const DOMAINS: DomainConfig[] = [
  // ... Java existant
  {
    label: 'Vue',
    color: '#42B983',
    freshrssStreamId: 'user/-/label/Vue',
    outputLabel: 'Output/Vue'
  }
];
```

**3. Créer label Gmail**:
- `Output/Vue` avec couleur #42B983

**4. Tester** :
```bash
pnpm run build && pnpm start
```

**Modulation du flow** :
- Modifier `src/index.ts` pour loop sur `DOMAINS` (actuellement: Java uniquement)
- Prompts scoring déjà disponibles dans `src/ai/scoring-prompts.ts`
- Tout le reste (scoring, rendering, email) est générique

---

## 🐛 Dépannage

### Problème: Aucun article fetché de FreshRSS

**Cause 1**: FRESHRSS_BASE_URL ou FRESHRSS_TOKEN invalide

**Solution**:
1. Vérifier `.env` → `FRESHRSS_BASE_URL` pointe vers serveur
2. Tester accès: `curl https://rss.your-domain.com/api/greader.php`
3. Régénérer token: FreshRSS → Paramètres → API → Token
4. Mettre à jour `.env` et GitHub Secrets

**Cause 2**: Catégorie/Stream ID inexistant

**Solution**:
1. Vérifier catégorie existe: FreshRSS → Flux → Catégories
2. Vérifier `src/config.ts` → `freshrssStreamId` = `user/-/label/Java`
3. Stream ID case-sensitive (Java ≠ java)

### Problème: Scoring failed - réponse AI invalide

**Cause**: Claude Haiku ne retourne pas score 1-10

**Solution**:
1. Vérifier logs: "Invalid score response"
2. Vérifier prompt dans `src/ai/scoring-prompts.ts` force `["score": number]`
3. Article skippé si réponse invalide → continue avec suivant
4. Vérifier OPENROUTER_API_KEY valide

### Problème: Rate limit 429 (OpenRouter)

**Cause**: Trop de scoring OpenRouter

**Solution**:
- Retry logic automatique: 1s → 2s → 4s (max 3)
- Vérifier logs: "Rate limit hit (429), retrying in Xms"
- Réduire articles ou attendre avant prochain run
- FreshRSS n'a pas de rate limits (self-hosted)

### Problème: Gmail auth failed

**Cause**: Refresh token expiré ou invalide

**Solution**:
1. Regénérer refresh token (OAuth2 Playground)
2. Mettre à jour `.env` et GitHub Secrets
3. Vérifier scopes: `gmail.readonly` + `gmail.modify`
4. Tester avec `pnpm start`

### Problème: Label "Output/Java" not found

**Cause**: Label pas créé dans Gmail

**Solution**:
1. Gmail web → Paramètres → Labels → Créer nouveau label
2. Nom exact: `Output/Java` (case-sensitive)
3. Couleur recommandée: #FF6B6B
4. Tester avec `pnpm start`

### Problème: FreshRSS serveur inaccessible

**Cause**: VPS down ou firewall bloque port

**Solution**:
1. Tester accès direct: `curl https://rss.your-domain.com`
2. Vérifier Docker container: `docker ps | grep freshrss`
3. Vérifier firewall VPS autorise port 80/443
4. Vérifier DNS pointe vers VPS IP

---

## 📊 Métriques et performance

### Temps d'exécution moyen (digest complet)

| Phase | Durée | % Total |
|-------|-------|---------|
| Fetch FreshRSS (20 articles) | 0.5-1s | 3-5% |
| Claude Haiku scoring (20 × 0.5s) | 10-11s | 50-55% |
| Agrégation by score | 0.2s | 1% |
| Render HTML digest | 0.5s | 2-3% |
| Envoi Gmail + label | 2-3s | 10-15% |
| **Total** | **14-18s** | **100%** |

**Note**: FreshRSS self-hosted est ~2-3x plus rapide que Feedly API (pas de rate limits, serveur local).

### Consommation tokens

**Par article** :
- **Prompt** (title + summary): ~300 tokens
- **Response** (score 1-10): ~20 tokens
- **Total/article**: ~320 tokens

**Hebdomadaire** (20 articles × 52 semaines) :
- **Total/semaine**: ~6,400 tokens
- **Total/an**: ~332,800 tokens
- **Coût Claude Haiku**: ~$0.025/semaine (~$1.30/an)

### Coûts comparés

| Solution | Hébergement/an | AI/an | Total/an |
|----------|----------------|-------|----------|
| **FreshRSS + Haiku** (actuel) | ~$60-131 (VPS) | $1.30 | **$61-132** |
| Feedly Enterprise + Haiku | $216 | $1.30 | $217 |
| Web scraping + Llama | $60 (VPS) | $0 | $60 |

**Verdict**: FreshRSS + Claude Haiku = meilleur ratio contrôle/qualité/coût (moins cher que Feedly, meilleure qualité que web scraping)

---

## 📝 Licence

MIT License - Voir [LICENSE](LICENSE)

---

## 🤝 Contribution

Les PRs sont bienvenues ! Pour des changements majeurs:
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing`)
3. Commit les changements (`git commit -m 'feat: add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing`)
5. Ouvrir une Pull Request

---

## 📮 Contact

Pour questions ou suggestions, ouvrir une issue GitHub.

---

**Built with ❤️ using TypeScript, FreshRSS, Claude Haiku, and Gmail API**
