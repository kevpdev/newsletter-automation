# Plan détaillé newsletter automatisée (Node.js + TypeScript + GitHub Actions)

---

## Vue d'ensemble du workflow

`textInput/Java (newsletter) 
    ↓ [Fetch + Extract metadata]
    ↓ [Summarize with IA (Llama 3.3)]
    ↓ [Parse: Title + 3 Key Points + Action]
    ↓ [Render HTML with domain color]
    ↓ [Send to Output/Java + Mark as Processed]`

**Key differences vs plan précédent** :

- ✅ **1 email in = 1 email out** (même domaine, pas agrégation globale).
- ✅ **Contenu structuré** : Titre + Impact + 3 points + action (pas juste résumé libre).
- ✅ **Marquage des emails traités** : label `Processed` sur les originaux.
- ✅ **Envoi directement en Output/** : pas brouillon, envoyé immédiatement.

---

## Phase 1 – Structure & Setup (pnpm)

## 1.1 Structure du repo

`bashnewsletter-automation/
├── .github/
│   └── workflows/
│       └── run-batch.yml
├── src/
│   ├── types.ts                    *# Interfaces*
│   ├── config.ts                   *# Config + vars d'env*
│   ├── gmail/
│   │   ├── auth.ts                 *# OAuth2 GCP*
│   │   ├── fetch.ts                *# Récupérer emails Input/**
│   │   ├── extract.ts              *# Metadata + nettoyage*
│   │   └── send.ts                 *# Envoi Output/* + label Processed*
│   ├── ai/
│   │   ├── prompt.ts               *# Construire requête IA*
│   │   ├── openrouter.ts           *# Appel OpenRouter (Llama 3.3)*
│   │   └── parser.ts               *# Parser résultats (Title/Points/Action)*
│   ├── renderer.ts                 *# Génération HTML coloré*
│   ├── logger.ts                   *# Winston logging*
│   └── main.ts                     *# Orchestration principale*
├── tests/
│   ├── parser.test.ts              *# Tests parser IA*
│   └── renderer.test.ts            *# Tests rendu HTML*
├── .env.example
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── README.md`

## 1.2 Initialisation pnpm

`bashpnpm init
pnpm add typescript @types/node dotenv googleapis nodemailer winston axios cheerio
pnpm add -D jest ts-jest @types/jest ts-node
npx tsc --init`

## 1.3 Scripts package.json

`json"scripts": {
  "build": "tsc",
  "start": "node dist/main.ts",
  "test": "jest",
  "test:watch": "jest --watch"
}`

---

## Phase 2 – Types & Configuration

## 2.1 Types (`src/types.ts`)

`ts*// Email brut depuis Gmail*
export interface InputEmail {
  id: string;
  label: string;           *// "Java", "Angular", "DevOps", etc.*
  subject: string;
  from: string;
  date: Date;
  htmlContent: string;
  plainContent?: string;
}

*// Métadonnées extraites*
export interface EmailMetadata {
  domain: string;          *// "Java", "Angular", etc.*
  domainColor: string;     *// "#FF6B6B", etc.*
  subject: string;
  from: string;
  date: Date;
  contentCleaned: string;  *// HTML/text nettoyé des \r\n, guillemets*
}

*// Résumé structuré par l'IA*
export interface AISummary {
  title: string;           *// Titre concis*
  impact: string;          *// 1-2 lignes d'impact*
  keyPoints: [string, string, string];  *// Exactement 3 points clés*
  action: string;          *// Action concrète à faire*
}

*// Email synthèse final à envoyer*
export interface OutputEmail {
  domain: string;
  color: string;
  subject: string;
  htmlContent: string;     *// HTML généré*
  to: string;              *// "user@gmail.com"*
}

*// Config globale*
export interface DomainConfig {
  label: string;           *// "Java", "Angular", etc.*
  color: string;           *// hex ou rgb*
  inputLabel: string;      *// "Input/Java"*
  outputLabel: string;     *// "Output/Java"*
  processedLabel: string;  *// "Processed" (global ou spécifique)*
}

export interface Config {
  gmail: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  openrouter: {
    apiKey: string;
    model: string;         *// "meta-llama/llama-3.3-70b-instruct-free"*
  };
  domains: Record<string, DomainConfig>;
  userEmail: string;       *// "you@gmail.com"*
  logging: {
    level: "debug" | "info" | "warn" | "error";
  };
}`

## 2.2 Config (`src/config.ts`)

`tsexport const defaultDomainConfig: Record<string, DomainConfig> = {
  java: { label: "Java", color: "#FF6B6B", inputLabel: "Input/Java", outputLabel: "Output/Java", processedLabel: "Processed" },
  angular: { label: "Angular", color: "#DD0031", inputLabel: "Input/Angular", outputLabel: "Output/Angular", processedLabel: "Processed" },
  devops: { label: "DevOps", color: "#1D63F7", inputLabel: "Input/DevOps", outputLabel: "Output/DevOps", processedLabel: "Processed" },
  ai: { label: "AI", color: "#9D4EDD", inputLabel: "Input/AI", outputLabel: "Output/AI", processedLabel: "Processed" },
  architecture: { label: "Architecture", color: "#3A86FF", inputLabel: "Input/Architecture", outputLabel: "Output/Architecture", processedLabel: "Processed" },
  security: { label: "Security", color: "#FB5607", inputLabel: "Input/Security", outputLabel: "Output/Security", processedLabel: "Processed" },
  frontend: { label: "Frontend", color: "#8338EC", inputLabel: "Input/Frontend", outputLabel: "Output/Frontend", processedLabel: "Processed" },
  vue: { label: "Vue", color: "#42B983", inputLabel: "Input/Vue", outputLabel: "Output/Vue", processedLabel: "Processed" }
};`

Variables d'env (`.env.example` + GitHub Secrets) :

`textGMAIL_CLIENT_ID=<client-id>.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=<client-secret>
GMAIL_REFRESH_TOKEN=<refresh-token-oauth2>
OPENROUTER_API_KEY=<openrouter-key>
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct-free
USER_EMAIL=your-email@gmail.com
LOG_LEVEL=info`

---

## Phase 3 – Gmail API (OAuth2 GCP)

## 3.1 Authentification (`src/gmail/auth.ts`)

`tsimport { google, gmail_v1 } from "googleapis";
import { Config } from "../config";

export async function authenticateGmail(config: Config): Promise<gmail_v1.Gmail> {
  const { OAuth2 } = google.auth;

  const oAuth2Client = new OAuth2(
    config.gmail.clientId,
    config.gmail.clientSecret,
    "urn:ietf:wg:oauth:2.0:oob"
  );

  oAuth2Client.setCredentials({
    refresh_token: config.gmail.refreshToken
  });

  await oAuth2Client.getAccessToken();

  return google.gmail({ version: "v1", auth: oAuth2Client });
}`

## 3.2 Récupérer les emails Input/* (`src/gmail/fetch.ts`)

`tsexport async function fetchInputEmails(
  gmail: gmail_v1.Gmail,
  inputLabels: string[],
  maxPerLabel = 5
): Promise<InputEmail[]>`

- Pour chaque label `Input/Java`, `Input/Angular`, etc. :
    - Utiliser `users.messages.list({ q:` label:"Input/Java" is:unread `})`.
    - Récupérer les N derniers emails non traités.
    - Pour chaque : `users.messages.get({ format: "full" })`.
    - Parser les headers (From, Subject, Date) et le contenu (HTML ou text).

## 3.3 Extraire métadonnées (`src/gmail/extract.ts`)

`tsexport async function extractMetadata(
  email: InputEmail,
  domainConfig: Record<string, DomainConfig>
): Promise<EmailMetadata>`

- Extraire le domaine depuis le label (Input/Java → "Java").
- Récupérer la couleur associée depuis `domainConfig`.
- Nettoyer le contenu :
    - Enlever les `\r\n` et remplacer par des espaces.
    - Enlever les guillemets échappés (`\"`).
    - Découper le texte si trop long (garder max ~2000 caractères pour le prompt IA).

## 3.4 Envoyer email synthèse (`src/gmail/send.ts`)

`tsexport async function sendOutputEmail(
  gmail: gmail_v1.Gmail,
  output: OutputEmail,
  config: Config
): Promise<string>

export async function markAsProcessed(
  gmail: gmail_v1.Gmail,
  emailId: string,
  processedLabel: string
): Promise<void>`

- Construire un message MIME HTML.
- Encoder en base64 URL-safe.
- Appeler `users.messages.send()` (ou `users.drafts.create` si tu préfères les brouillons).
- Ajouter le label `Output/Java` au message envoyé (via `users.messages.modify`).
- Ajouter le label `Processed` au mail original (via `users.messages.modify`).

---

## Phase 4 – IA : Prompt, Appel & Parsing

## 4.1 Construire le prompt (`src/ai/prompt.ts`)

`tsexport function buildPrompt(metadata: EmailMetadata): string`

Exemple de prompt structuré :

`textVous êtes un expert technique en [DOMAIN].
Synthétisez ce newsletter en JSON strict (pas de markdown, pas de texte avant/après le JSON).

Contenu newsletter:
---
[CLEANED_CONTENT]
---

Répondez UNIQUEMENT avec ce JSON (valide, parseable):
{
  "title": "Titre très concis du sujet principal (10-15 mots max)",
  "impact": "Pourquoi c'est important en 1-2 lignes",
  "keyPoints": [
    "Point clé 1: détail spécifique (15-20 mots)",
    "Point clé 2: détail spécifique (15-20 mots)",
    "Point clé 3: détail spécifique (15-20 mots)"
  ],
  "action": "Une action concrète que le lecteur peut faire maintenant (20-30 mots)"
}`

**Conseil** : Forcer le modèle à répondre en JSON strict (pas de texte avant/après) simplifie beaucoup le parsing.[github+1](https://github.com/mmeerrkkaa/openrouter-kit)

## 4.2 Appel OpenRouter (`src/ai/openrouter.ts`)

`tsexport async function callOpenRouter(
  apiKey: string,
  model: string,
  prompt: string
): Promise<{ json: string; tokensUsed?: number }>`

- Header `Authorization: Bearer ${apiKey}`.
- Model : `meta-llama/llama-3.3-70b-instruct-free` (ou autre).[openrouter+1](https://openrouter.ai/docs/quickstart)
- Gérer retries 429 (rate limit) avec backoff exponentiel.
- Logging : durée, tokens, status HTTP.

## 4.3 Parser les résultats (`src/ai/parser.ts`)

`tsexport function parseAISummary(jsonString: string): AISummary

export function validateAISummary(summary: AISummary): boolean`

- Extraire le JSON de la réponse (chercher le premier `{...}` valide).
- Parser et valider :
    - `title` : string non vide, < 50 caractères.
    - `impact` : string, 1-3 lignes.
    - `keyPoints` : array de 3 strings.
    - `action` : string non vide.
- Si parsing échoue : logguer l'erreur, fallback ou retry.

---

## Phase 5 – Rendu HTML

## 5.1 Génération HTML (`src/renderer.ts`)

`tsexport function renderOutputEmail(
  metadata: EmailMetadata,
  summary: AISummary
): string`

Structure HTML TDAH-friendly :

`xml<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    .domain-header { 
      border-left: 8px solid [COLOR]; 
      padding: 20px;
      background-color: [COLOR]20;  /* 20% opacity */
    }
    .key-point { margin: 10px 0; }
    .action-box { 
      background: #fffacd; 
      border-left: 4px solid #FF6B6B; 
      padding: 15px; 
    }
  </style>
</head>
<body>
  <h1 style="border-left: 8px solid [COLOR]; padding-left: 15px;">
    [TITLE]
  </h1>
  
  <div class="domain-header">
    <strong>Domaine:</strong> [DOMAIN] | 
    <strong>Source:</strong> [FROM] | 
    <strong>Date:</strong> [DATE]
  </div>
  
  <h2>💡 Impact</h2>
  <p>[IMPACT]</p>
  
  <h2>📌 3 Points clés</h2>
  <ul>
    <li class="key-point">[POINT 1]</li>
    <li class="key-point">[POINT 2]</li>
    <li class="key-point">[POINT 3]</li>
  </ul>
  
  <h2>🎯 Action concrète</h2>
  <div class="action-box">
    [ACTION]
  </div>
</body>
</html>`

Points clés :

- Couleurs inline par domaine (utilise le `color` du `metadata`).
- Emoji pour clarté TDAH.
- Section "Action" bien visible (fond différent).

---

## Phase 6 – Logging

## 6.1 Logger (`src/logger.ts`)

Utiliser `winston` :

`tsimport winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" })
  ]
});

export default logger;`

Logs critiques à placer :

`tslogger.info(`📧 Fetching Input/Java emails...`);
logger.debug(`Email ${id}: extracted metadata`, { domain: "Java", from: "..." });
logger.info(`🤖 Calling OpenRouter (model: llama-3.3)...`);
logger.debug(`AI response tokens: ${tokens}`);
logger.error(`❌ Failed to parse AI response`, { error, raw: jsonString });
logger.info(`✉️ Sent Output/Java email (id: ${draftId})`);
logger.info(`✅ Marked email ${originalId} as Processed`);`

---

## Phase 7 – Orchestration (`src/main.ts`)

Pseudo-code du flux principal :

`tsasync function main() {
  try {
    logger.info("🚀 Starting newsletter batch...");

    *// 1. Load config*
    const config = loadConfig();

    *// 2. Auth Gmail*
    const gmail = await authenticateGmail(config);

    *// 3. Fetch Input/* emails*
    const inputEmails = await fetchInputEmails(gmail, Object.values(config.domains).map(d => d.inputLabel));
    logger.info(`📧 Fetched ${inputEmails.length} emails`);

    *// 4. Process each email*
    for (const email of inputEmails) {
      try {
        *// 4a. Extract metadata*
        const metadata = await extractMetadata(email, config.domains);

        *// 4b. Summarize with IA*
        const prompt = buildPrompt(metadata);
        const { json: rawJson } = await callOpenRouter(config.openrouter.apiKey, config.openrouter.model, prompt);
        const summary = parseAISummary(rawJson);
        validateAISummary(summary); *// throw if invalid// 4c. Render HTML*
        const htmlContent = renderOutputEmail(metadata, summary);

        *// 4d. Send Output/* email*
        const domainCfg = config.domains[metadata.domain.toLowerCase()];
        const output: OutputEmail = {
          domain: metadata.domain,
          color: metadata.domainColor,
          subject: `[${metadata.domain}] ${summary.title}`,
          htmlContent,
          to: config.userEmail
        };
        const draftId = await sendOutputEmail(gmail, output, config);
        logger.info(`✉️ Sent Output/${metadata.domain} email`);

        *// 4e. Mark as Processed*
        await markAsProcessed(gmail, email.id, domainCfg.processedLabel);
        logger.info(`✅ Marked email ${email.id} as Processed`);

      } catch (err) {
        logger.error(`❌ Failed processing email ${email.id}`, { error: err });
        *// Continue with next email (no hard stop)*
      }
    }

    logger.info(`✨ Batch complete. Processed ${inputEmails.length} emails.`);
  } catch (err) {
    logger.error("🔥 Batch failed:", err);
    process.exit(1);
  }
}

main();`

---

## Phase 8 – GitHub Actions Workflow

## 8.1 Workflow `.github/workflows/run-batch.yml`

`textname: Newsletter Batch

on:
  schedule:
    - cron: "0 8 * * 1"    # Lundi à 08:00 UTC
  workflow_dispatch:

jobs:
  batch:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm run build

      - name: Run batch
        env:
          GMAIL_CLIENT_ID: ${{ secrets.GMAIL_CLIENT_ID }}
          GMAIL_CLIENT_SECRET: ${{ secrets.GMAIL_CLIENT_SECRET }}
          GMAIL_REFRESH_TOKEN: ${{ secrets.GMAIL_REFRESH_TOKEN }}
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
          OPENROUTER_MODEL: meta-llama/llama-3.3-70b-instruct-free
          USER_EMAIL: ${{ secrets.USER_EMAIL }}
          LOG_LEVEL: info
        run: pnpm start

      - name: Upload logs (if failed)
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: logs
          path: logs/`

**Secrets à ajouter** :

`textGMAIL_CLIENT_ID
GMAIL_CLIENT_SECRET
GMAIL_REFRESH_TOKEN
OPENROUTER_API_KEY
USER_EMAIL`

**Cron timing** :

- `0 8 * * 1` = Lundi à 08:00 UTC.
- Ajuste selon ton fuseau horaire (UTC+1 en hiver, UTC+2 en été en France).

---

## Phase 9 – Tests Unitaires

## 9.1 Parser tests (`tests/parser.test.ts`)

`tsdescribe("parseAISummary", () => {
  it("should parse valid JSON response", () => {
    const json = `{
      "title": "New Java Framework",
      "impact": "Improves performance",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "action": "Upgrade to v2"
    }`;
    const result = parseAISummary(json);
    expect(result.title).toBe("New Java Framework");
    expect(result.keyPoints.length).toBe(3);
  });

  it("should fail gracefully on invalid JSON", () => {
    const json = "not json";
    expect(() => parseAISummary(json)).toThrow();
  });
});`

## 9.2 Renderer tests (`tests/renderer.test.ts`)

`tsdescribe("renderOutputEmail", () => {
  it("should generate valid HTML with domain color", () => {
    const metadata: EmailMetadata = { */* mock */* };
    const summary: AISummary = { */* mock */* };
    const html = renderOutputEmail(metadata, summary);
    expect(html).toContain("<html");
    expect(html).toContain(metadata.domainColor);
    expect(html).toContain(summary.title);
  });
});`

---

## Phase 10 – Sécurité & Bonnes pratiques

## 10.1 GitHub Secrets

- **Jamais** stocker les clés en clair dans le code.[dylanbritz+1](https://dylanbritz.dev/writing/scheduled-cron-jobs-github/)
- Utiliser **GitHub Secrets** pour :
    - `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`
    - `OPENROUTER_API_KEY`
    - `USER_EMAIL` (techniquement pas secret, mais mieux en Secrets).

## 10.2 Gmail Scopes

Limiter aux scopes minimaux :

`texthttps://www.googleapis.com/auth/gmail.readonly   # Lire les emails
https://www.googleapis.com/auth/gmail.modify      # Modifier labels et envoyer`

**Pas besoin de** `gmail.send` si tu utilises `messages.send()` avec le scope `gmail.modify`.

## 10.3 Données envoyées à OpenRouter

- ⚠️ **Ne pas envoyer** d'infos personnelles (noms, adresses email internes, tokens) dans les prompts.
- Nettoyer le contenu des emails avant de l'envoyer à l'IA (déjà fait en Phase 3.3).
- Lire les conditions de rétention OpenRouter.[openrouter+1](https://openrouter.ai/docs/guides/privacy/logging)

## 10.4 Gestion des erreurs

- Si un email échoue : logger et **continuer** avec le suivant (pas de hard stop).
- Si OpenRouter rate limit (429) : backoff exponentiel et retry.
- Si Gmail auth échoue : log et `process.exit(1)` (arrête le batch).

## 10.5 Logs

- Ne jamais logger les tokens API, clés, ou contenu complet des emails.[swiftorial](https://www.swiftorial.com/tutorials/artificial_intelligence/openai_api/best_practices/logging_best_practices)
- Logger les **métadonnées utiles** : timestamp, domain, email ID, token count, status.

---

## Phase 11 – Documentation & Deploy

## 11.1 README.md

Inclure :

- Setup (clone, `pnpm install`, config GCP OAuth2).
- Obtenir le refresh token (script one-shot).
- Configurer GitHub Secrets.
- Cron timing et fuseau horaire.
- Structure des labels Input/* et Output/**.
- Comment debuguer (logs).

## 11.2 .env.example

`textGMAIL_CLIENT_ID=<client-id>.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=<client-secret>
GMAIL_REFRESH_TOKEN=<refresh-token-oauth2>
OPENROUTER_API_KEY=<openrouter-key>
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct-free
USER_EMAIL=your-email@gmail.com
LOG_LEVEL=info`

---

## Résumé ordre de codage

1. **Phase 1** : Setup pnpm + tsconfig.
2. **Phase 2** : Types + config (interfaces, defaults).
3. **Phase 3** : Gmail auth + fetch + extract + send.
4. **Phase 4** : Prompt builder + OpenRouter client + parser.
5. **Phase 5** : Renderer HTML.
6. **Phase 6** : Logger Winston.
7. **Phase 7** : Main orchestration (glue all together).
8. **Phase 8** : GitHub Actions workflow.
9. **Phase 9** : Tests Jest.
10. **Phase 10** : Security review.
11. **Phase 11** : README + .env.example.

---

## Différences clés vs plan précédent

| Aspect | Plan 1 | Plan actuel |
| --- | --- | --- |
| **Flux** | Agrégation globale | 1 email in = 1 email out |
| **Structure IA** | Résumé libre | Title + Impact + 3 Points + Action |
| **Destination** | Brouillon unique | Output/* label spécifique |
| **Marquage** | Aucun | Label `Processed` sur original |
| **Timing** | Fréquence variable | Lundi 08:00 UTC |
| **Modèle IA** | Claude 3.5 Sonnet | Llama 3.3 (gratuit) |

---


