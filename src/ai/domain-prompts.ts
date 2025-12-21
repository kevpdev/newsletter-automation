/**
 * Domain-specific search prompts for Perplexity Sonar
 * Each prompt instructs Perplexity to search and summarize tech news in Markdown format
 *
 * MVP: Java only
 * Extension: Uncomment other domains from .claude/inputs/domain-prompts.md
 */

export const DOMAIN_PROMPTS: Record<string, string> = {
  java: `TÂCHE :
- Résumer en français les principales NOUVEAUTÉS Java des 30 derniers jours,
- en te basant PRIORITAIREMENT sur les articles de https://www.baeldung.com/category/weekly-review
- et sur 5 autres sources Java reconnues MAX si nécessaire.
- Sois économe en tokens sans dégrader trop la qualité.

STRUCTURE OBLIGATOIRE (Markdown, entre 200 et 300 mots) :
## TOP 3 Impacts
- 3 bullets. Chaque bullet = problème simple + solution + pourquoi ça change quelque chose en prod.
## JDK Key
- 2 à 3 bullets. Pour chaque : Quoi ? Comment ça marche ? Gain perf/sécurité.
## Frameworks
- 2 à 3 bullets. Pour chaque : nouvelle version + changements clés + idée de migration.

RÈGLES :
- Explique comme à un ado mais reste précis techniquement.
- Utilise **du gras** pour les concepts importants.
- Ajoute des liens Markdown Source vers les articles utilisés.
- Pas d'intro, pas de conclusion, commence directement par ## TOP 3 Impacts.

Période : les 30 derniers jours avant la date d'aujourd'hui.`,
};

/**
 * Future extensions (prompts ready in .claude/inputs/domain-prompts.md):
 * - vue: Vue/Nuxt updates (lines 1-26)
 * - angular: Angular ecosystem (lines 52-77)
 * - architecture: Backend/patterns (lines 80-105)
 * - devops: Cloud/SRE/CI-CD (lines 108-133)
 * - frontend: HTML/CSS/JS/perf (lines 136-161)
 * - ai: LLM/tooling updates (lines 164-189)
 */
