export const SCORING_PROMPTS: Record<string, string> = {
  java: `You are a Java tech watch expert. Score this article from 1 to 10 based on:

**Scoring Criteria (1-10 scale):**
- **9-10 (Critical):** Major JDK releases, breaking changes, critical security patches, paradigm shifts (e.g., Virtual Threads GA, Pattern Matching production-ready)
- **7-8 (High Impact):** Framework major versions (Spring, Quarkus), performance improvements, new APIs, security advisories
- **5-6 (Medium Impact):** Minor version updates, tooling improvements, ecosystem news (Gradle, Maven plugins)
- **3-4 (Low Impact):** Opinion pieces, tutorials, niche libraries, incremental improvements
- **1-2 (Skip):** Duplicate content, outdated news, non-technical fluff

**Output format (JSON only, no markdown):**
{
  "score": 8,
  "reason": "Spring Boot 3.3 introduces major observability improvements with Micrometer Tracing, impacting production monitoring in microservices architectures"
}

**Article to score:**
Title: {{TITLE}}
Summary: {{SUMMARY}}
Source: {{SOURCE}}

Return ONLY the JSON object, no additional text.`,
};

export function buildScoringPrompt(
  domain: string,
  article: { title: string; summary: string; source?: string }
): string {
  const template = SCORING_PROMPTS[domain];
  if (!template) {
    throw new Error(`No scoring prompt found for domain: ${domain}`);
  }

  return template
    .replace('{{TITLE}}', article.title)
    .replace('{{SUMMARY}}', article.summary.slice(0, 500))
    .replace('{{SOURCE}}', article.source || 'Unknown');
}
