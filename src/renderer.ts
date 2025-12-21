import type { ParsedMarkdown } from './types.js';
import type { DomainConfig } from './types.js';
import { convertMarkdownToHtml } from './markdown-converter.js';

/**
 * Converts hex color to rgba with specified opacity.
 * @param hex - Hex color code (e.g., "#FF6B6B")
 * @param opacity - Opacity value between 0 and 1
 * @returns RGBA color string
 */
function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Maps section heading keywords to emoji markers for visual scanning.
 *
 * @param heading - Section heading text
 * @param index - Section index (fallback)
 * @returns Emoji for this section
 */
function getEmojiForSection(heading: string, index: number): string {
  const headingLower = heading.toLowerCase();

  if (headingLower.includes('impact')) return '💡';
  if (headingLower.includes('key') || headingLower.includes('jdk')) return '📌';
  if (headingLower.includes('action') || headingLower.includes('next')) return '🎯';
  if (headingLower.includes('framework')) return '🚀';
  if (headingLower.includes('update') || headingLower.includes('core')) return '🔄';
  if (headingLower.includes('tool') || headingLower.includes('écosystème')) return '🛠️';
  if (headingLower.includes('security') || headingLower.includes('sécurité')) return '🔒';
  if (headingLower.includes('perf')) return '⚡';

  // Fallback: numbered emoji for unknown headings
  const emojiNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
  return emojiNumbers[index] || '📍';
}

/**
 * Renders Parsed Markdown as ADHD-friendly HTML email.
 *
 * Structure:
 * - Domain header with colored border and background
 * - Optional title (h1) with colored bottom border
 * - Dynamic sections (h2) with emoji markers and bullets
 * - Optional citations footer with source links
 *
 * All styles are inline for email compatibility.
 *
 * @param parsedMarkdown - Parsed Markdown structure from Perplexity
 * @param domain - Domain configuration with label and color
 * @returns HTML string for email body
 *
 * @example
 * const parsed = parseMarkdownToStructure(markdown);
 * const html = renderHTML(parsed, DOMAINS[0]);
 */
export function renderHTML(parsedMarkdown: ParsedMarkdown, domain: DomainConfig): string {
  const { title, sections, citations } = parsedMarkdown;
  const { label, color } = domain;

  // Convert hex color to rgba for background (20% opacity)
  const bgColor = hexToRgba(color, 0.2);

  // Render sections dynamically
  const sectionsHtml = sections
    .map((section, index) => {
      const emoji = getEmojiForSection(section.heading, index);
      const bulletsHtml = section.bullets
        .map((bullet) => {
          const htmlBullet = convertMarkdownToHtml(escapeHtml(bullet));
          return `    <li style="margin-bottom: 12px;">${htmlBullet}</li>`;
        })
        .join('\n');

      return `
  <!-- Section: ${escapeHtml(section.heading)} -->
  <h2 style="color: #444; font-size: 20px; font-weight: 600; margin: 30px 0 15px 0;">
    ${emoji} ${escapeHtml(section.heading)}
  </h2>
  <ul style="font-size: 16px; line-height: 1.8; color: #555; margin: 0 0 25px 0; padding-left: 25px; background-color: #fff; padding: 20px 20px 20px 45px; border-radius: 4px;">
${bulletsHtml}
  </ul>`;
    })
    .join('\n');

  // Render citations if present
  const citationsHtml = citations
    ? `
  <!-- Citations -->
  <div style="margin-top: 40px; padding: 20px; background-color: #f5f5f5; border-radius: 4px; border-left: 3px solid ${color};">
    <h3 style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #666;">
      📚 Sources
    </h3>
    <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
${citations.map((url) => `      <li style="margin-bottom: 8px;"><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="color: ${color}; text-decoration: none;">${escapeHtml(url)}</a></li>`).join('\n')}
    </ul>
  </div>`
    : '';

  const titleSection = title
    ? `
  <!-- Title Section -->
  <h1 style="color: #222; font-size: 28px; font-weight: 700; margin: 0 0 20px 0; padding-bottom: 15px; border-bottom: 4px solid ${color};">
    ${escapeHtml(title)}
  </h1>`
    : '';

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${label} Tech Watch</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">

  <!-- Domain Header -->
  <div style="background-color: ${bgColor}; border-left: 8px solid ${color}; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
    <h3 style="margin: 0; color: ${color}; font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
      ${label} Tech Watch
    </h3>
  </div>
${titleSection}
${sectionsHtml}
${citationsHtml}

  <!-- Footer -->
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 14px;">
    <p style="margin: 0;">
      Tech Watch · Powered by Perplexity Sonar
    </p>
  </div>

</body>
</html>
`.trim();
}

/**
 * Escapes HTML special characters to prevent XSS.
 * @param text - Text to escape
 * @returns Escaped HTML-safe string
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}
