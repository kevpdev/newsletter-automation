import type { EmailMetadata } from '../types.js';

export function buildPrompt(metadata: EmailMetadata): string {
  const systemMessage = `You are a technical newsletter summarizer for developers with ADHD.
Your task is to extract the most important information and make it actionable.

OUTPUT REQUIREMENTS:
- Output ONLY valid JSON, no markdown code blocks, no extra text
- Use this exact structure: {"title": "...", "impact": "...", "keyPoints": ["...", "...", "..."], "action": "..."}
- title: Maximum 50 characters, capture the main topic
- impact: One sentence explaining why this matters (business/technical value)
- keyPoints: Exactly 3 bullet points with concrete information
- action: One concrete action the reader can take (start with a verb)

IMPORTANT: Your response must be parseable JSON. Do not wrap it in markdown.`;

  const userMessage = `Summarize this newsletter:

From: ${metadata.sender}
Subject: ${metadata.subject}
Domain: ${metadata.domain}

Content:
${metadata.htmlContent}`;

  return `${systemMessage}\n\n${userMessage}`;
}
