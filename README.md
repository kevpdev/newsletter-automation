# Newsletter Automation - Tech Digest

> **Agrégation intelligente de tech news via Feedly** - Collecte d'articles via Feedly Collections, scoring avec Claude Haiku, génération de digests ADHD-friendly, envoi par email chaque semaine.

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

**Newsletter Automation** collecte les articles pertinents depuis vos collections Feedly, les score automatiquement via Claude Haiku, et génère un digest hebdomadaire organisé par priorité.

### Flow de données

```
┌─────────────────┐
│  GitHub Actions │  Lundi 08:00 UTC
│  (cron weekly)  │
└────────┬────────┘
         │
         v
┌─────────────────────────────────────────────────────┐
│  1. Récupération Feedly (Collections)              │
│     - Fetch N articles non-lus d'une collection     │
│     - Title, summary, URL, date publication        │
└────────┬────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────┐
│  2. Scoring AI (Claude Haiku)                      │
│     - Évalue pertinence (1-10) pour domaine        │
│     - Rapide: ~0.5s/article                        │
└────────┬────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────┐
│  3. Agrégation par Score                           │
│     - 🔴 Critical: score ≥ 8                       │
│     - 🟠 Important: score 6-7                      │
│     - 🟡 Bonus: score 3-5                          │
└────────┬────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────┐
│  4. Render HTML Digest ADHD-Friendly                │
│     - Couleur domaine (#FF6B6B Java, #DD0031 Angular) │
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

### Avantages Feedly

✅ **Pas de scraping** - API officielle Feedly
✅ **Déduplication** - Articles groupés par source
✅ **Smart scoring** - Contexte domaine via Claude Haiku
✅ **Agrégation** - Format digest lisible (3-5 articles clés)

---

## 🏗️ Architecture

### Approche intelligente et centralisée

**Flow principal** : Feedly Collections → Claude Haiku Scoring → Agrégation → HTML Digest → Email

**Design** : Un digest par collection Feedly, articles groupés par score (Critical/Important/Bonus)

### Stack technique

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| **Runtime** | Node.js 20 + TypeScript 5 | Exécution typée strict mode |
| **Feedly API** | REST API officielle | Récupération articles collections |
| **AI Scoring** | Claude Haiku (OpenRouter) | Scoring rapide 1-10/article |
| **Email** | Gmail API (OAuth2) | Envoi digest + label |
| **Automation** | GitHub Actions | Exécution hebdomadaire (cron) |
| **Logging** | Winston | Console + fichiers rotatifs |

### Composants clés

```
src/
├── types.ts              # Interfaces (FeedlyArticle, Article, ScoredArticle, Digest, OutputEmail)
├── config.ts             # Domaines + Feedly collectionId + couleurs
├── feedly/
│   ├── client.ts         # Client Feedly API (fetch articles)
│   └── types.ts          # Types Feedly
├── ai/
│   ├── scoring.ts        # Scoring Claude Haiku (batch par domaine)
│   ├── scoring-prompts.ts # Prompts spécifiques domaines
│   └── openrouter.ts     # Client OpenRouter + retry logic
├── aggregator.ts         # Agrégation par score (critical/important/bonus)
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

- ✅ **Feedly Collections** - Lecture multi-sources (9+ newsletters)
- ✅ **Récupération articles** - Title, summary, URL, date (fetch 20 articles/semaine)
- ✅ **Articles non-lus** - Filtre automatique, marque comme lus après traitement
- ✅ **Déduplication** - Evite articles dupliqués par URL

### Scoring intelligent

- 🤖 **Claude Haiku** - Évaluation pertinence 1-10 par article (~0.5s/article)
- 📊 **Contexte domaine** - Prompts spécifiques Java/Vue/Angular/etc.
- 🔄 **Retry logic** - Backoff exponentiel sur rate limit (429)
- ⚡ **Batch efficient** - 20 articles scorés en ~10 secondes

### Digest ADHD-friendly

- 🎨 **Couleurs domaine** - 8 couleurs distinctes (Java #FF6B6B, Angular #DD0031)
- 🔴 **Section Critical** - Articles score ≥ 8 (les plus importants)
- 🟠 **Section Important** - Articles score 6-7
- 🟡 **Section Bonus** - Articles score 3-5 (nice-to-read)
- 🔗 **Liens cliquables** - URLs vers articles originaux
- 📱 **Responsive** - Inline styles tous clients email

### Sécurité & Qualité

- 🔒 **Validation scoring** - Score 1-10 uniquement, rejet si invalide
- 🔐 **OAuth2 Gmail + Feedly** - Tokens refresh automatique
- 🚫 **No secrets** - Variables d'environnement uniquement
- 📝 **Logging complet** - Winston console + logs/ rotatifs

---

## 📦 Prérequis

- **Node.js** ≥ 20.x
- **pnpm** ≥ 8.x
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
# OpenRouter API (Claude Haiku scoring)
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Feedly API (collecte articles)
FEEDLY_API_KEY=xxxxxxx

# Gmail OAuth2 (envoi digests)
GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxxxx
GMAIL_REFRESH_TOKEN=xxxxx

# Email utilisateur (destinataire digests)
USER_EMAIL=votre-email@example.com
```

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

### Obtenir Feedly API Key

1. Compte Feedly (https://feedly.com)
2. Settings → API → Personal access tokens
3. Créer token "Perso" → Copier la clé

### Obtenir OpenRouter API Key

1. S'inscrire sur https://openrouter.ai
2. Dashboard → API Keys → Create Key
3. Copier la clé `sk-or-v1-xxxxx` (utilise Claude Haiku)

### Configurer Collections Feedly

1. **Dans Feedly web** :
   - Créer ou identifier collections (ex: "Java Tech", "Vue Weekly", etc.)
   - Copier **Collection ID** (format: `collection/xxxxx/category/xxxxx`)

2. **Dans `src/config.ts`** :
   ```typescript
   export const DOMAINS: DomainConfig[] = [
     {
       label: 'Java',
       color: '#FF6B6B',
       feedlyCollectionId: 'collection/xxxxx/category/xxxxx',
       outputLabel: 'Output/Java'
     },
     // ... autres domaines
   ];
   ```

### Créer les labels Gmail

Manuellement dans Gmail web, créer **Output/** labels pour chaque domaine :

**Labels Output (digests)** :
- `Output/Java` (couleur #FF6B6B recommandée)
- `Output/Angular` (couleur #DD0031 recommandée)
- `Output/DevOps` (couleur #1D63F7 recommandée)
- `Output/AI` (couleur #9D4EDD recommandée)
- `Output/Architecture` (couleur #3A86FF recommandée)
- `Output/Security` (couleur #FB5607 recommandée)
- `Output/Frontend` (couleur #8338EC recommandée)
- `Output/Vue` (couleur #42B983 recommandée)

---

## 💻 Utilisation

### Développement local

```bash
# Build TypeScript
pnpm run build

# Exécuter une fois
pnpm start

# Watch mode (rebuild auto)
pnpm run build --watch
```

### Tests

```bash
# Tous les tests
pnpm test

# Watch mode
pnpm run test:watch

# Coverage
pnpm run test:coverage
```

### Logs

Les logs sont écrits dans:
- **Console** - Niveau INFO
- **Fichier** - `logs/newsletter-automation.log` (rotation quotidienne)

Format:
```
2025-01-15 10:30:45 [info]: 🚀 Starting Java Tech Digest (Feedly + AI Scoring)
2025-01-15 10:30:46 [info]: 📁 Domain: Java
2025-01-15 10:30:47 [info]: 📡 Fetching articles from Feedly...
2025-01-15 10:30:48 [info]: ✓ Fetched 20 articles
2025-01-15 10:30:49 [info]: 🤖 Scoring articles with Claude Haiku...
2025-01-15 10:30:59 [info]: ✓ Scored 20 articles
2025-01-15 10:31:00 [info]: 📊 Digest breakdown: 3 critical, 5 important, 8 bonus
2025-01-15 10:31:01 [info]: 🎨 Rendering HTML digest...
2025-01-15 10:31:02 [info]: 📧 Sending tech digest email...
2025-01-15 10:31:04 [info]: ============================================================
2025-01-15 10:31:04 [info]: ✅ Java Tech Digest completed in 19.2s
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
1. **Feedly API** : Fetch 20 articles non-lus de la collection Java
2. **Claude Haiku** : Score 1-10 chaque article (~0.5s/article = 10s total)
3. **Agrégation** : Grouper par score → Critical (≥8), Important (6-7), Bonus (3-5)
4. **Digest HTML** : Render sections avec couleur Java, liens articles
5. **Email** : Envoyer à USER_EMAIL avec label Output/Java

### Secrets GitHub

Configurer dans **Settings → Secrets and variables → Actions**:

| Secret | Exemple | Description |
|--------|---------|-------------|
| `FEEDLY_API_KEY` | `xxxxxxx` | Token API Feedly |
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
│   ├── types.ts               # Interfaces (FeedlyArticle, Article, ScoredArticle, Digest, OutputEmail)
│   ├── config.ts              # Domaines + Feedly collectionId + couleurs
│   ├── feedly/
│   │   ├── client.ts          # Client Feedly API (fetch articles, mark as read)
│   │   └── types.ts           # Types Feedly (FeedlyArticle, FeedlyResponse)
│   ├── ai/
│   │   ├── scoring.ts         # Batch scoring Claude Haiku
│   │   ├── scoring-prompts.ts # Prompts spécifiques domaines
│   │   ├── openrouter.ts      # Client OpenRouter + retry logic
│   │   └── prompts/           # Prompts par domaine (vue.prompt.ts, etc.)
│   ├── aggregator.ts          # Agrégation par score (critical/important/bonus)
│   ├── renderer.ts            # HTML digest ADHD-friendly (sections score)
│   ├── gmail/
│   │   ├── auth.ts            # OAuth2 Gmail
│   │   └── send.ts            # Envoi digest + label Output/*
│   ├── logger.ts              # Winston (console + logs/)
│   └── index.ts               # Orchestration (fetch → score → aggregate → render → send)
├── tests/                     # Tests Jest
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

| Domaine | Couleur | Feedly Collection | Scoring Prompt |
|---------|---------|------------------|-----------------|
| **Java** | #FF6B6B | `collection/xxx/java` | Java MVP actif |
| **Angular** | #DD0031 | `collection/xxx/angular` | Prêt |
| **DevOps** | #1D63F7 | `collection/xxx/devops` | Prêt |
| **AI** | #9D4EDD | `collection/xxx/ai` | Prêt |
| **Architecture** | #3A86FF | `collection/xxx/arch` | Prêt |
| **Security** | #FB5607 | `collection/xxx/sec` | Prêt |
| **Frontend** | #8338EC | `collection/xxx/fe` | Prêt |
| **Vue** | #42B983 | `collection/xxx/vue` | Prêt |

### Activer un nouveau domaine

**1. Ajouter la config** dans `src/config.ts`:

```typescript
export const DOMAINS: DomainConfig[] = [
  // ... Java existant
  {
    label: 'Vue',
    color: '#42B983',
    feedlyCollectionId: 'collection/xxxxx/category/xxxxx',
    outputLabel: 'Output/Vue'
  }
];
```

**2. Créer scoring prompt** (si custom) dans `src/ai/scoring-prompts.ts`:

```typescript
export const SCORING_PROMPTS: Record<string, string> = {
  java: `...`,
  vue: `Tu es un expert Vue 3. Évalue la pertinence (1-10)...`
};
```

**3. Créer label Gmail**:
- `Output/Vue` avec couleur #42B983

**4. Tester** :
```bash
pnpm run build && pnpm start
```

**Modulation du flow** :
- Modifier `src/index.ts` pour loop sur `DOMAINS` (actuellement: Java uniquement)
- Ajouter prompts spécifiques dans `src/ai/scoring-prompts.ts`
- Tout le reste (scoring, rendering, email) est générique

---

## 🐛 Dépannage

### Problème: Aucun article fetchés de Feedly

**Cause 1**: Collection ID invalide

**Solution**:
1. Vérifier `src/config.ts` → `feedlyCollectionId` exact (format: `collection/xxxxx/category/xxxxx`)
2. Tester collection dans Feedly web
3. Copier Collection ID depuis API Feedly settings

**Cause 2**: FEEDLY_API_KEY invalide ou expirée

**Solution**:
1. Regénérer token dans Feedly → Settings → API → Personal access tokens
2. Mettre à jour `.env` et GitHub Secrets
3. Vérifier token commence par `xxxxxxx`

### Problème: Scoring failed - réponse AI invalide

**Cause**: Claude Haiku ne retourne pas score 1-10

**Solution**:
1. Vérifier logs: "Invalid score response"
2. Vérifier prompt dans `src/ai/scoring-prompts.ts` force `["score": number]`
3. Article skippé si réponse invalide → continue avec suivant
4. Vérifier OPENROUTER_API_KEY valide

### Problème: Rate limit 429 (Feedly ou OpenRouter)

**Cause 1**: Trop de requêtes Feedly (20 articles)

**Solution**:
- Réduire `fetchFeedlyArticles()` limit (ex: 10 au lieu de 20)
- Feedly gratuit: ~100 req/heure

**Cause 2**: Trop de scoring OpenRouter

**Solution**:
- Retry logic automatique: 1s → 2s → 4s (max 3)
- Vérifier logs: "Rate limit hit (429), retrying in Xms"
- Réduire articles ou attendre avant prochain run

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

### Problème: Digest envoyé mais structure HTML cassée

**Cause**: Renderer bug ou contenu malformé

**Solution**:
1. Vérifier logs: "Rendering digest HTML"
2. Vérifier articles ont: title, summary, url, score
3. Tester HTML localement: `pnpm start` + check email
4. Reporter issue avec logs si erreur persistante

---

## 📊 Métriques et performance

### Temps d'exécution moyen (digest complet)

| Phase | Durée | % Total |
|-------|-------|---------|
| Fetch Feedly (20 articles) | 2-3s | 10-15% |
| Claude Haiku scoring (20 × 0.5s) | 10-11s | 50-55% |
| Agrégation by score | 0.2s | 1% |
| Render HTML digest | 0.5s | 2-3% |
| Envoi Gmail + label | 2-3s | 10-15% |
| **Total** | **15-20s** | **100%** |

### Consommation tokens

**Par article** :
- **Prompt** (title + summary): ~300 tokens
- **Response** (score 1-10): ~20 tokens
- **Total/article**: ~320 tokens

**Hebdomadaire** (20 articles × 52 semaines) :
- **Total/semaine**: ~6,400 tokens
- **Total/an**: ~332,800 tokens
- **Coût Claude Haiku**: ~$0.025/semaine (~$1.30/an)

### Efficacité vs alternatives

| Solution | Temps | Tokens/semaine | Coût/an |
|----------|-------|-----------------|---------|
| **Feedly + Haiku** (actuel) | 15-20s | 6,400 | $1.30 |
| Feedly + Claude Opus | 15-20s | 6,400 | $65 |
| Web scraping + Llama | 2-3min | 200,000 | $0 |
| Manual tech watch | ∞ | 0 | $0 (temps!) |

**Verdict**: Feedly + Claude Haiku = meilleur ratio coût/qualité/temps

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

**Built with ❤️ using TypeScript, Feedly, Claude Haiku, and Gmail API**
