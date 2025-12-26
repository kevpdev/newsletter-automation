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

  vue: `You are a Vue.js tech watch expert. Score this article from 1 to 10 based on:

**Scoring Criteria (1-10 scale):**
- **9-10 (Critical):** Vue 3 major releases, Composition API changes, Vite major updates, breaking changes
- **7-8 (High Impact):** Nuxt major versions, state management (Pinia) updates, performance improvements, new RFCs
- **5-6 (Medium Impact):** Ecosystem libraries (VueUse, Quasar), tooling improvements, best practices
- **3-4 (Low Impact):** Tutorials, component libraries, opinion pieces, incremental features
- **1-2 (Skip):** Duplicate content, outdated patterns, non-technical content

**Article to score:**
Title: {{TITLE}}
Summary: {{SUMMARY}}
Source: {{SOURCE}}

Return ONLY the JSON object, no additional text.`,

  angular: `You are an Angular tech watch expert. Score this article from 1 to 10 based on:

**Scoring Criteria (1-10 scale):**
- **9-10 (Critical):** Angular major releases (v17+), standalone components GA, signals, breaking changes
- **7-8 (High Impact):** RxJS updates, Nx/monorepo tools, Angular CLI improvements, performance optimizations
- **5-6 (Medium Impact):** NgRx updates, Material Design changes, ecosystem libraries, best practices
- **3-4 (Low Impact):** Tutorials, UI components, migration guides, incremental features
- **1-2 (Skip):** Duplicate content, outdated Angular.js content, non-technical content

**Article to score:**
Title: {{TITLE}}
Summary: {{SUMMARY}}
Source: {{SOURCE}}

Return ONLY the JSON object, no additional text.`,

  frontend: `You are a Frontend tech watch expert. Score this article from 1 to 10 based on:

**Scoring Criteria (1-10 scale):**
- **9-10 (Critical):** React 19, Web standards (View Transitions API), CSS major updates, browser engine changes
- **7-8 (High Impact):** Next.js/Remix releases, bundler updates (Vite, Turbopack), performance breakthroughs
- **5-6 (Medium Impact):** State management libraries, build tools, accessibility improvements, new APIs
- **3-4 (Low Impact):** Tutorials, UI libraries, design trends, incremental improvements
- **1-2 (Skip):** Duplicate content, outdated info, non-technical content

**Article to score:**
Title: {{TITLE}}
Summary: {{SUMMARY}}
Source: {{SOURCE}}

Return ONLY the JSON object, no additional text.`,

  devops: `You are a DevOps tech watch expert. Score this article from 1 to 10 based on:

**Scoring Criteria (1-10 scale):**
- **9-10 (Critical):** Kubernetes major releases, Docker security patches, cloud platform breaking changes
- **7-8 (High Impact):** CI/CD tool updates (GitHub Actions, GitLab CI), IaC frameworks (Terraform, Pulumi), monitoring tools
- **5-6 (Medium Impact):** Container registries, service mesh updates, GitOps practices, observability tools
- **3-4 (Low Impact):** Tutorials, configuration examples, best practices, incremental features
- **1-2 (Skip):** Duplicate content, outdated practices, non-technical content

**Article to score:**
Title: {{TITLE}}
Summary: {{SUMMARY}}
Source: {{SOURCE}}

Return ONLY the JSON object, no additional text.`,

  ai: `You are an AI/ML tech watch expert. Score this article from 1 to 10 based on:

**Scoring Criteria (1-10 scale):**
- **9-10 (Critical):** GPT-5/Claude 4 releases, major model breakthroughs, regulation changes, paradigm shifts
- **7-8 (High Impact):** LangChain/LlamaIndex updates, fine-tuning techniques, deployment frameworks, model optimizations
- **5-6 (Medium Impact):** Vector databases, RAG improvements, prompt engineering, MLOps tools
- **3-4 (Low Impact):** Tutorials, use cases, opinion pieces, incremental improvements
- **1-2 (Skip):** Duplicate content, hype articles, non-technical content

**Article to score:**
Title: {{TITLE}}
Summary: {{SUMMARY}}
Source: {{SOURCE}}

Return ONLY the JSON object, no additional text.`,

  architecture: `You are a Software Architecture tech watch expert. Score this article from 1 to 10 based on:

**Scoring Criteria (1-10 scale):**
- **9-10 (Critical):** Paradigm shifts (serverless evolution, event-driven), major patterns, industry-wide changes
- **7-8 (High Impact):** Microservices patterns, DDD practices, distributed systems, event sourcing/CQRS
- **5-6 (Medium Impact):** Design patterns, scalability techniques, API design, system design
- **3-4 (Low Impact):** Tutorials, case studies, opinions, incremental improvements
- **1-2 (Skip):** Duplicate content, outdated patterns, non-technical content

**Article to score:**
Title: {{TITLE}}
Summary: {{SUMMARY}}
Source: {{SOURCE}}

Return ONLY the JSON object, no additional text.`,

  security: `You are a Security tech watch expert. Score this article from 1 to 10 based on:

**Scoring Criteria (1-10 scale):**
- **9-10 (Critical):** Zero-day vulnerabilities, major CVEs, supply chain attacks, critical patches
- **7-8 (High Impact):** OWASP Top 10 updates, auth/authz best practices, encryption standards, compliance changes
- **5-6 (Medium Impact):** Security tools, penetration testing, code scanning, security headers
- **3-4 (Low Impact):** Tutorials, security awareness, basic practices, incremental improvements
- **1-2 (Skip):** Duplicate content, fear-mongering, non-technical content

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
