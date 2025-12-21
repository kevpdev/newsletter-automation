/** Markdown section with heading and bullets */
export interface MarkdownSection {
  heading: string;
  bullets: string[];
}

/** Parsed Markdown structure from Perplexity response */
export interface ParsedMarkdown {
  title?: string;
  sections: MarkdownSection[];
  citations?: string[];
}

/** Email to send to Gmail Output/* labels */
export interface OutputEmail {
  to: string;
  subject: string;
  htmlBody: string;
  outputLabel: string;
}

/** Domain configuration (color, labels) */
export interface DomainConfig {
  label: string;
  color: string;
  outputLabel: string;
}
