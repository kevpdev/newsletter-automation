export interface InputEmail {
  id: string;
  labelName: string;
  rawContent: unknown;
}

export interface EmailMetadata {
  sender: string;
  subject: string;
  htmlContent: string;
  domain: string;
}

export interface AISummary {
  title: string;
  impact: string;
  keyPoints: string[];
  action: string;
}

export interface OutputEmail {
  to: string;
  subject: string;
  htmlBody: string;
  outputLabel: string;
}

export interface DomainConfig {
  label: string;
  color: string;
  inputLabel: string;
  outputLabel: string;
}
