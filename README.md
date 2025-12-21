# Newsletter Automation - Java Tech Watch

> **Veille technologique Java automatisée** - Recherche web hebdomadaire via Perplexity Sonar, génération d'emails ADHD-friendly, envoi automatique via Gmail.

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

**Newsletter Automation** est un système de veille technologique **proactif** qui automatise la recherche, le résumé et l'envoi d'emails sur les nouveautés Java.

### Flow de données

```
┌─────────────────┐
│  GitHub Actions │  Lundi 08:00 UTC
│  (cron weekly)  │
└────────┬────────┘
         │
         v
┌─────────────────────────────────────────────────────┐
│  1. Recherche Web (Perplexity Sonar via OpenRouter) │
│     - Prompt Java (force sources Baeldung)          │
│     - Réponse: Markdown avec ## sections + liens    │
└────────┬────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────┐
│  2. Parse Markdown → Structure                      │
│     - Sections: TOP 3 Impacts, JDK Key, Frameworks  │
│     - Bullets + Citations                           │
└────────┬────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────┐
│  3. Render HTML ADHD-Friendly                       │
│     - Couleurs domaine (#FF6B6B pour Java)          │
│     - Emojis visuels (💡📌🚀)                        │
│     - Liens cliquables [Source](url) → <a>          │
└────────┬────────────────────────────────────────────┘
         │
         v
┌─────────────────────────────────────────────────────┐
│  4. Envoi Gmail + Label Output/Java                 │
│     - Subject: [Java] Tech Watch - Week X, 2025     │
│     - Apply label: Output/Java                      │
└─────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

### Approche proactive

- ❌ **Avant**: Réactif (lecture emails Input/* → traitement)
- ✅ **Maintenant**: Proactif (recherche web → génération → envoi)

### Stack technique

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| **Runtime** | Node.js 20 + TypeScript 5 | Exécution typée strict mode |
| **AI** | Perplexity Sonar (OpenRouter) | Recherche web temps réel |
| **Email** | Gmail API (OAuth2) | Envoi + gestion labels |
| **Automation** | GitHub Actions | Exécution hebdomadaire |
| **Parser** | Regex Markdown custom | Conversion MD → HTML XSS-safe |

### Composants clés

```
src/
├── index.ts              # Orchestration principale (60L)
├── ai/
│   ├── openrouter.ts     # Client OpenRouter + retry logic
│   └── domain-prompts.ts # Prompts domaine-spécifiques
├── markdown-converter.ts # Parse Markdown + escape HTML
├── renderer.ts           # Génération HTML ADHD-friendly
├── gmail/
│   ├── auth.ts          # OAuth2 Gmail
│   └── send.ts          # Envoi email + labeling
├── types.ts             # Interfaces TypeScript
├── config.ts            # Configuration domaines
└── logger.ts            # Logging Winston
```

---

## ✨ Fonctionnalités

### Recherche intelligente

- ✅ **Perplexity Sonar `:online`** - Recherche web temps réel (30 derniers jours)
- ✅ **Force sources Baeldung** - Minimum 3 articles baeldung.com/category/weekly-review
- ✅ **Retry logic** - Backoff exponentiel sur rate limit (429)
- ✅ **Token efficient** - ~750 tokens/semaine (95% réduction vs avant)

### Email ADHD-friendly

- 🎨 **Couleurs domaine** - Border + background (#FF6B6B pour Java)
- 😀 **Emojis visuels** - 💡 Impact, 📌 Key Points, 🚀 Frameworks
- 🔗 **Liens cliquables** - Conversion `[Source](url)` → `<a href>`
- 📱 **Responsive** - Inline styles compatibles tous clients email

### Sécurité

- 🔒 **XSS protection** - Escape HTML préservant balises `<a>` et `<strong>`
- 🔐 **OAuth2 Gmail** - Tokens refresh automatique
- 🚫 **No secrets in code** - Variables d'environnement uniquement

### Performance

| Métrique | Avant (réactif) | Maintenant (proactif) | Gain |
|----------|-----------------|------------------------|------|
| **Temps traitement** | 16 minutes | 40 secondes | **96% plus rapide** |
| **Tokens/semaine** | 16,500 | 750 | **95% réduction** |
| **Lignes de code** | 1,455 | 1,200 | **17% réduction** |

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
# OpenRouter API (Perplexity Sonar)
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Gmail OAuth2
GMAIL_CLIENT_ID=xxxxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=xxxxx
GMAIL_REFRESH_TOKEN=xxxxx

# Destination email
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

### Obtenir OpenRouter API Key

1. S'inscrire sur https://openrouter.ai
2. Dashboard → API Keys → Create Key
3. Copier la clé `sk-or-v1-xxxxx`

### Créer les labels Gmail

Manuellement dans Gmail web:
- `Output/Java` (couleur rouge #FF6B6B recommandée)

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
2025-01-15 10:30:45 [info]: 🚀 Starting Java Tech Watch (Proactive mode)
2025-01-15 10:30:46 [info]: 📁 Domain: Java
2025-01-15 10:30:47 [info]: 🔍 Searching with Perplexity Sonar...
2025-01-15 10:31:20 [info]: ✓ Parsed 3 sections
2025-01-15 10:31:21 [info]: 📧 Sending tech watch email...
2025-01-15 10:31:23 [info]: ✅ Java Tech Watch completed in 38.2s
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
5. Run `pnpm start`
6. Upload logs on failure (artifact 7 jours)

### Secrets GitHub

Configurer dans **Settings → Secrets and variables → Actions**:

| Secret | Exemple | Description |
|--------|---------|-------------|
| `OPENROUTER_API_KEY` | `sk-or-v1-xxxxx` | Clé API OpenRouter |
| `GMAIL_CLIENT_ID` | `xxxxx.apps.googleusercontent.com` | OAuth2 Client ID |
| `GMAIL_CLIENT_SECRET` | `xxxxx` | OAuth2 Client Secret |
| `GMAIL_REFRESH_TOKEN` | `xxxxx` | OAuth2 Refresh Token |
| `USER_EMAIL` | `user@example.com` | Email destinataire |

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
│   ├── ai/
│   │   ├── domain-prompts.ts  # Prompts Perplexity (Java MVP)
│   │   └── openrouter.ts      # Client API + retry
│   ├── gmail/
│   │   ├── auth.ts            # OAuth2 Gmail
│   │   └── send.ts            # Envoi email + label
│   ├── config.ts              # Config domaines (Java)
│   ├── index.ts               # Orchestration principale
│   ├── logger.ts              # Winston logger
│   ├── markdown-converter.ts  # Parse MD → HTML
│   ├── renderer.ts            # Génération HTML
│   └── types.ts               # Interfaces TypeScript
├── tests/                     # Tests Jest
├── logs/                      # Logs Winston (gitignored)
├── .env.example               # Template variables env
├── package.json
├── tsconfig.json              # Config TypeScript strict
└── README.md
```

---

## 🔄 Extension multi-domaines

L'architecture supporte **8 domaines** au total. **MVP actuel**: Java uniquement.

### Domaines disponibles

Prompts prêts dans `.claude/inputs/domain-prompts.md`:

1. ✅ **Java** (actif) - JDK, Spring, frameworks
2. Vue - Vue 3, Nuxt, Pinia
3. Angular - Angular, RxJS, NgRx
4. Architecture - Backend patterns, DDD, microservices
5. DevOps - Cloud, CI/CD, SRE
6. Frontend - HTML/CSS/JS, Core Web Vitals
7. IA - LLM, agents, tooling
8. Security - OWASP, crypto, pentest

### Activer un nouveau domaine

**1. Ajouter le prompt** dans `src/ai/domain-prompts.ts`:

```typescript
export const DOMAIN_PROMPTS: Record<string, string> = {
  java: `...`,  // Existant
  vue: `TÂCHE:
- Résumer les NOUVEAUTÉS Vue/Nuxt des 30 derniers jours...
...`,  // Copier depuis .claude/inputs/domain-prompts.md lignes 1-26
};
```

**2. Ajouter la config** dans `src/config.ts`:

```typescript
export const DOMAINS: DomainConfig[] = [
  { label: 'Java', color: '#FF6B6B', outputLabel: 'Output/Java' },
  { label: 'Vue', color: '#42B983', outputLabel: 'Output/Vue' },  // Nouveau
];
```

**3. Créer le label Gmail**:
- Manuellement: `Output/Vue` avec couleur #42B983

**4. Adapter `src/index.ts`** pour loop sur domaines:

```typescript
async function main() {
  for (const domain of DOMAINS) {
    await processDomain(domain);
  }
}

async function processDomain(domain: DomainConfig) {
  const prompt = DOMAIN_PROMPTS[domain.label.toLowerCase()];
  const markdown = await searchWithPerplexity(prompt);
  // ... reste du flow
}
```

**Aucune modification** requise pour:
- `markdown-converter.ts` (générique)
- `renderer.ts` (supporte tous domaines)
- `openrouter.ts` (multi-model)

---

## 🐛 Dépannage

### Problème: Pas de liens dans l'email

**Cause**: Perplexity n'inclut pas de sources

**Solution**:
1. Vérifier modèle = `perplexity/sonar:online` (ligne 5 de `openrouter.ts`)
2. Vérifier prompt force liens: "OBLIGATOIRE: [...] lien Markdown au format [Source](url)"
3. Tester avec `pnpm start` et vérifier logs OpenRouter

### Problème: Aucune référence Baeldung

**Cause**: Prompt pas assez contraignant

**Solution**:
```typescript
// src/ai/domain-prompts.ts ligne 12
- OBLIGATOIRE: Tu DOIS utiliser AU MINIMUM 3 articles de
  https://www.baeldung.com/category/weekly-review
- Recherche d'abord sur site:baeldung.com
```

### Problème: Rate limit 429

**Cause**: Trop de requêtes OpenRouter

**Solution**:
- Le retry logic (backoff exponentiel) est automatique
- Attendre 1s → 2s → 4s entre retries
- Vérifier logs: "Rate limit hit (429), retrying in Xms"

### Problème: Gmail auth failed

**Cause**: Refresh token expiré ou invalide

**Solution**:
1. Regénérer refresh token (OAuth2 Playground)
2. Mettre à jour `.env` et GitHub Secrets
3. Vérifier scopes: `gmail.readonly` + `gmail.modify`

### Problème: Label "Output/Java" not found

**Cause**: Label pas créé dans Gmail

**Solution**:
1. Gmail web → Paramètres → Labels → Créer nouveau label
2. Nom exact: `Output/Java` (case-sensitive)
3. Tester avec `pnpm start`

---

## 📊 Métriques et performance

### Temps d'exécution moyen

| Phase | Durée | % Total |
|-------|-------|---------|
| Recherche Perplexity | 30-35s | 85% |
| Parse Markdown | 0.1s | 0.3% |
| Render HTML | 0.2s | 0.5% |
| Envoi Gmail | 2-3s | 7% |
| **Total** | **35-40s** | **100%** |

### Consommation tokens (Java MVP)

- **Prompt**: ~500 tokens
- **Response**: ~250 tokens
- **Total/semaine**: ~750 tokens
- **Coût estimé**: $0.0008/semaine (~$0.04/an)

**Extension 8 domaines**: ~6,000 tokens/semaine (~$0.31/an)

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

**Built with ❤️ using TypeScript, Perplexity Sonar, and Gmail API**
