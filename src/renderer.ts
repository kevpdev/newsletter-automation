import type { Digest } from './aggregator.js';
import type { DomainConfig, ScoredArticle } from './types.js';

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

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

function renderSection(
  heading: string,
  articles: ScoredArticle[],
  accentColor: string
): string {
  if (articles.length === 0) return '';

  const articlesHtml = articles
    .map(
      (article) => `
    <li style="margin-bottom: 20px; padding: 15px; background-color: #fff; border-radius: 4px; border-left: 3px solid ${accentColor};">
      <div style="margin-bottom: 8px;">
        <strong style="color: ${accentColor}; font-size: 16px;">[${article.score}/10]</strong>
        <a href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer" style="color: #222; text-decoration: none; font-weight: 600; font-size: 16px;">
          ${escapeHtml(article.title)}
        </a>
      </div>
      <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
        ${escapeHtml(article.reason)}
      </p>
      ${article.source ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #999;">Source: ${escapeHtml(article.source)}</p>` : ''}
    </li>`
    )
    .join('\n');

  return `
  <h2 style="color: #444; font-size: 20px; font-weight: 600; margin: 30px 0 15px 0;">
    ${heading}
  </h2>
  <ul style="list-style: none; padding: 0; margin: 0 0 30px 0;">
${articlesHtml}
  </ul>`;
}

function renderEmptyDigest(domain: DomainConfig): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${domain.label} Tech Digest</title>
</head>
<body style="font-family: sans-serif; padding: 40px; text-align: center;">
  <h1 style="color: #999;">No articles this week</h1>
  <p style="color: #666;">Check back next week for updates!</p>
</body>
</html>
`.trim();
}

export function renderDigest(digest: Digest, domain: DomainConfig): string {
  const { critical, important, bonus } = digest;
  const { label, color } = domain;

  const bgColor = hexToRgba(color, 0.2);

  if (critical.length === 0 && important.length === 0 && bonus.length === 0) {
    return renderEmptyDigest(domain);
  }

  const criticalSection = renderSection(
    '🔥 Critical Updates (Must Read)',
    critical,
    '#FF6B6B'
  );

  const importantSection = renderSection(
    '📌 Important Updates',
    important,
    '#3A86FF'
  );

  const bonusSection = renderSection(
    '💡 Bonus Reads',
    bonus,
    '#06D6A0'
  );

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${label} Tech Digest</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">

  <!-- Domain Header -->
  <div style="background-color: ${bgColor}; border-left: 8px solid ${color}; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
    <h3 style="margin: 0; color: ${color}; font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
      ${label} Tech Digest
    </h3>
    <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
      ${digest.total} articles scored and curated
    </p>
  </div>

  ${criticalSection}
  ${importantSection}
  ${bonusSection}

  <!-- Footer -->
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 14px;">
    <p style="margin: 0;">
      Tech Digest · Powered by Feedly + Claude 3.5 Haiku
    </p>
  </div>

</body>
</html>
`.trim();
}
