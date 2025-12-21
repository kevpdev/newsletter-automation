import type { ParsedMarkdown, MarkdownSection } from './types.js';

/**
 * Parses Markdown response from Perplexity into structured format.
 * Extracts ## headings as sections, bullets under each heading, and optional h1 title.
 *
 * @param markdown - Raw Markdown text from Perplexity Sonar
 * @returns Structured ParsedMarkdown with sections and bullets
 * @throws Error if markdown is empty
 *
 * @example
 * const markdown = `## TOP 3 Impacts
 * - Java 22 released
 * - Spring Boot 3.3
 * ## JDK Key
 * - Virtual threads GA`;
 *
 * const parsed = parseMarkdownToStructure(markdown);
 * // { title: undefined, sections: [{ heading: "TOP 3 Impacts", bullets: [...] }, ...] }
 */
export function parseMarkdownToStructure(markdown: string): ParsedMarkdown {
  if (!markdown || markdown.trim().length === 0) {
    throw new Error('Markdown content is empty');
  }

  const lines = markdown.split('\n').map((line) => line.trim());
  let title: string | undefined;
  const sections: MarkdownSection[] = [];
  const citations: string[] = [];

  let currentSection: MarkdownSection | null = null;

  for (const line of lines) {
    // Extract h1 title (# Title)
    if (line.startsWith('# ') && !title) {
      title = line.substring(2).trim();
      continue;
    }

    // Extract h2 section heading (## Heading)
    if (line.startsWith('## ')) {
      // Save previous section if exists
      if (currentSection) {
        sections.push(currentSection);
      }

      // Start new section
      const heading = line.substring(3).trim();
      currentSection = { heading, bullets: [] };
      continue;
    }

    // Extract bullet points (- bullet or * bullet)
    if ((line.startsWith('- ') || line.startsWith('* ')) && currentSection) {
      const bullet = line.substring(2).trim();
      if (bullet.length > 0) {
        currentSection.bullets.push(bullet);
      }
      continue;
    }

    // Extract URLs (basic citation detection)
    const urlMatch = line.match(/https?:\/\/[^\s)]+/);
    if (urlMatch && !citations.includes(urlMatch[0])) {
      citations.push(urlMatch[0]);
    }
  }

  // Push last section
  if (currentSection) {
    sections.push(currentSection);
  }

  // Fallback: If no sections found, create a "Summary" section with all content
  if (sections.length === 0) {
    const contentLines = lines
      .filter((line) => line.length > 0 && !line.startsWith('#'))
      .map((line) => (line.startsWith('- ') || line.startsWith('* ') ? line.substring(2).trim() : line));

    if (contentLines.length > 0) {
      sections.push({
        heading: 'Summary',
        bullets: contentLines,
      });
    }
  }

  return {
    title,
    sections,
    citations: citations.length > 0 ? citations : undefined,
  };
}

/**
 * Converts **bold** Markdown to <strong>bold</strong> HTML.
 *
 * @param text - Text with Markdown bold syntax
 * @returns HTML with <strong> tags
 *
 * @example
 * convertBoldToHtml("**Java 22**") // "<strong>Java 22</strong>"
 */
export function convertBoldToHtml(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/**
 * Converts [text](url) Markdown links to <a href="url">text</a> HTML.
 *
 * @param text - Text with Markdown link syntax
 * @returns HTML with <a> tags
 *
 * @example
 * convertLinksToHtml("[Baeldung](https://baeldung.com)")
 * // '<a href="https://baeldung.com" target="_blank" rel="noopener">Baeldung</a>'
 */
export function convertLinksToHtml(text: string): string {
  return text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}

/**
 * Converts Markdown text to HTML (combines bold + links conversion).
 *
 * @param text - Text with Markdown formatting
 * @returns HTML with <strong> and <a> tags
 *
 * @example
 * convertMarkdownToHtml("**Java 22** released [Source](https://...")
 * // "<strong>Java 22</strong> released <a href=...>Source</a>"
 */
export function convertMarkdownToHtml(text: string): string {
  let html = convertBoldToHtml(text);
  html = convertLinksToHtml(html);
  return html;
}
