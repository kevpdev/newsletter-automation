import type { InputEmail, EmailMetadata } from '../types.js';
import logger from '../logger.js';

interface GmailHeader {
  name?: string;
  value?: string;
}

interface GmailMessagePart {
  mimeType?: string;
  body?: {
    data?: string;
  };
  parts?: GmailMessagePart[];
}

interface GmailMessage {
  payload?: {
    headers?: GmailHeader[];
    body?: {
      data?: string;
    };
    mimeType?: string;
    parts?: GmailMessagePart[];
  };
}

function getHeader(headers: GmailHeader[], name: string): string {
  const header = headers.find((h) => h.name?.toLowerCase() === name.toLowerCase());
  return header?.value || '';
}

function extractHtmlBody(part: GmailMessagePart | undefined): string {
  if (!part) return '';

  if (part.mimeType === 'text/html' && part.body?.data) {
    return Buffer.from(part.body.data, 'base64url').toString('utf-8');
  }

  if (part.parts) {
    for (const subPart of part.parts) {
      const html = extractHtmlBody(subPart);
      if (html) return html;
    }
  }

  return '';
}

function sanitizeContent(content: string): string {
  return content.replace(/\r\n/g, ' ').replace(/\\"/g, '"').substring(0, 2000);
}

export function extractMetadata(inputEmail: InputEmail, domain: string): EmailMetadata {
  const message = inputEmail.rawContent as GmailMessage;
  const headers = message.payload?.headers || [];

  const sender = getHeader(headers, 'From');
  const subject = getHeader(headers, 'Subject');

  let rawHtml = '';
  if (message.payload?.body?.data && !message.payload?.parts) {
    rawHtml = Buffer.from(message.payload.body.data, 'base64url').toString('utf-8');
  } else {
    rawHtml = extractHtmlBody(message.payload);
  }

  const htmlContent = sanitizeContent(rawHtml);

  logger.info(`Extracted metadata for email: ${subject.substring(0, 50)}`);

  return {
    sender,
    subject,
    htmlContent,
    domain,
  };
}
