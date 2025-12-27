Parfait : OpenRouter + Claude Haiku pour la synthèse, et un rendu email **ultra simple** collent très bien à ton MVP.

Voici une **version mise à jour de la synthèse pour Claude Code**, centrée sur Haiku + rendu minimal :

***

# Synthèse Claude Code – Tech Digest + FreshRSS + OpenRouter (Haiku)

## Contexte

- FreshRSS tourne déjà sur un VPS OVH (4 vCPU / 8 Go RAM).
- Objectif :  
  - Récupérer les articles depuis FreshRSS,  
  - Les **résumer + scorer** avec **Claude Haiku via OpenRouter**,  
  - Produire un **email HTML minimaliste** très lisible pour un profil TDAH (2–5 liens maxi),  
  - Lancer ça via cron (GitHub Actions ou cron sur le VPS).

***

## 1. Collecte depuis FreshRSS

Interface souhaitée côté code :

```ts
export interface Article {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: Date;
  domain: string; // 'java' | 'vue' | 'angular' ...
}

export async function fetchArticlesForDomain(domain: string): Promise<Article[]>;
```

- Lecture via API FreshRSS (Google Reader / JSON) avec :
  - `FRESHRSS_BASE_URL` (ex: `https://rss.mondomaine.com`),
  - `FRESHRSS_TOKEN` (auth).

Mapping `domain` ↔ `streamId` dans `config.ts`.

***

## 2. Scoring + synthèse via OpenRouter / Claude Haiku

Utiliser OpenRouter pour appeler **Claude Haiku 3.5/4.5** (modèle rapide pour summarization).[1][2][3]

Interface :

```ts
export interface ScoredArticle extends Article {
  score: number;           // 1–10
  readTimeMinutes: number; // 2, 5, 10
  summaryShort: string;    // 1–3 phrases max
  isNoise?: boolean;
}

export async function scoreAndSummarizeArticles(
  domain: string,
  articles: Article[]
): Promise<ScoredArticle[]>;
```

Appel OpenRouter (pseudo) :

```ts
const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'anthropic/claude-4.5-haiku',
    messages: [{
      role: 'user',
      content: buildPrompt(domain, articles)
    }],
    response_format: { type: 'json' } // idéalement
  })
});
```

Prompt attendu :

- Contexte : domaine (Java, Vue, etc).
- Pour chaque article (title + summary + url), retourner un JSON :
  - `score` (1–10 pertinence),
  - `readTimeMinutes` (estimation),
  - `summaryShort` (max 3 phrases, langage simple),
  - `isNoise` (true si contenu peu utile / marketing).

***

## 3. Agrégation TDAH

Objectif : **micro‑digest**.

Règles :

```ts
const TDAH_LIMITS = {
  mustRead: 2,    // score ≥ 8
  niceToHave: 3   // score 6–7
};

export interface Digest {
  domain: string;
  date: string;
  mustRead: ScoredArticle[];
  niceToHave: ScoredArticle[];
}
```

Logiciel :

- Trier par `score` décroissant.
- `mustRead = top 2` avec `score >= 8`.
- `niceToHave = suivants` avec `6 <= score <= 7`, max 3.
- Autres : non envoyés, éventuellement logués dans un JSON.

***

## 4. Rendu HTML simple (email‑friendly)

Pas de template lourd, juste un HTML inline minimal, lisible dans Gmail.

Interface :

```ts
export function renderDigestHtml(digest: Digest): string;
```

Structure HTML :

```html
<!DOCTYPE html>
<html>
  <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height:1.5; color:#222;">
    <h1 style="font-size:20px;">[Java] Tech Digest – 2025‑01‑15</h1>

    <h2 style="font-size:18px; color:#d7263d;">🔥 Must‑read (max 2)</h2>
    <!-- Boucle sur mustRead -->
    <div style="border-left:4px solid #d7263d; padding-left:8px; margin-bottom:12px;">
      <a href="{{url}}" style="font-size:15px; font-weight:bold; color:#1a73e8; text-decoration:none;">
        {{title}}
      </a>
      <div style="font-size:12px; color:#555; margin-top:2px;">
        ⏱ {{readTimeMinutes}} min · Score {{score}}/10
      </div>
      <div style="font-size:13px; margin-top:4px;">
        {{summaryShort}}
      </div>
    </div>

    <h2 style="font-size:18px; color:#f4a261;">👍 Nice‑to‑have (max 3)</h2>
    <!-- Même pattern -->
  </body>
</html>
```

Contraintes :

- **Maximum 5 articles** par email (2 must‑read + 3 nice‑to‑have).
- Toujours afficher `readTimeMinutes` et `score` pour guider l’attention.
- Aucun CSS externe, uniquement du inline.

***

## 5. Exécution (cron)

Option GitHub Actions (recommandée) :
# hebdo seulement
schedule:
  - cron: `0 8 * * 1'  # Lundi 08:00 UTC`:
  - `fetchArticlesForDomain(domain)`
  - `scoreAndSummarizeArticles(domain, articles)`
  - `buildDigest(domain, scoredArticles, TDAH_LIMITS)`
  - `renderDigestHtml(digest)`
  - `sendEmail(html)` via Gmail API.

Secrets requis :

- `OPENROUTER_API_KEY`
- `FRESHRSS_BASE_URL`
- `FRESHRSS_TOKEN`
- `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`
- `USER_EMAIL`

***

## Résultat attendu

- 1 email / domain / semaine , **2–5 articles max** par email, chacun résumés par Haiku avec durée estimée.
- Rendu ultra simple, lisible sur mobile, parfait pour un profil TDAH : très peu de choix à faire, juste ouvrir les 1–2 liens 🔥.
