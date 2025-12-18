import { describe, it, expect, vi } from 'vitest';
import { extractMetadata } from '../../src/gmail/extract.js';
import type { InputEmail, EmailMetadata } from '../../src/types.js';

vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('extractMetadata', () => {
  it('should extract headers from simple message', () => {
    const inputEmail: InputEmail = {
      id: 'msg-1',
      labelName: 'Input/Java',
      rawContent: {
        payload: {
          headers: [
            { name: 'From', value: 'sender@example.com' },
            { name: 'Subject', value: 'Test Email Subject' },
          ],
          body: {
            data: Buffer.from('<h1>Hello World</h1>').toString('base64url'),
          },
        },
      },
    };

    const result: EmailMetadata = extractMetadata(inputEmail, 'java');

    expect(result.sender).toBe('sender@example.com');
    expect(result.subject).toBe('Test Email Subject');
    expect(result.htmlContent).toBe('<h1>Hello World</h1>');
    expect(result.domain).toBe('java');
  });

  it('should handle case-insensitive header lookup', () => {
    const inputEmail: InputEmail = {
      id: 'msg-2',
      labelName: 'Input/Angular',
      rawContent: {
        payload: {
          headers: [
            { name: 'from', value: 'test@test.com' },
            { name: 'SUBJECT', value: 'Mixed Case' },
          ],
          body: {
            data: Buffer.from('content').toString('base64url'),
          },
        },
      },
    };

    const result = extractMetadata(inputEmail, 'angular');

    expect(result.sender).toBe('test@test.com');
    expect(result.subject).toBe('Mixed Case');
  });

  it('should extract HTML from multipart message', () => {
    const inputEmail: InputEmail = {
      id: 'msg-3',
      labelName: 'Input/DevOps',
      rawContent: {
        payload: {
          headers: [
            { name: 'From', value: 'multi@example.com' },
            { name: 'Subject', value: 'Multipart Message' },
          ],
          mimeType: 'multipart/alternative',
          parts: [
            {
              mimeType: 'text/plain',
              body: {
                data: Buffer.from('Plain text').toString('base64url'),
              },
            },
            {
              mimeType: 'text/html',
              body: {
                data: Buffer.from('<p>HTML content</p>').toString('base64url'),
              },
            },
          ],
        },
      },
    };

    const result = extractMetadata(inputEmail, 'devops');

    expect(result.htmlContent).toBe('<p>HTML content</p>');
  });

  it('should handle nested multipart structures', () => {
    const inputEmail: InputEmail = {
      id: 'msg-4',
      labelName: 'Input/AI',
      rawContent: {
        payload: {
          headers: [
            { name: 'From', value: 'nested@example.com' },
            { name: 'Subject', value: 'Nested Parts' },
          ],
          mimeType: 'multipart/mixed',
          parts: [
            {
              mimeType: 'multipart/alternative',
              parts: [
                {
                  mimeType: 'text/plain',
                  body: { data: Buffer.from('Text').toString('base64url') },
                },
                {
                  mimeType: 'text/html',
                  body: {
                    data: Buffer.from('<div>Nested HTML</div>').toString(
                      'base64url'
                    ),
                  },
                },
              ],
            },
          ],
        },
      },
    };

    const result = extractMetadata(inputEmail, 'ai');

    expect(result.htmlContent).toBe('<div>Nested HTML</div>');
  });

  it('should sanitize content by removing \\r\\n', () => {
    const inputEmail: InputEmail = {
      id: 'msg-5',
      labelName: 'Input/Security',
      rawContent: {
        payload: {
          headers: [
            { name: 'From', value: 'sanitize@example.com' },
            { name: 'Subject', value: 'Sanitize Test' },
          ],
          body: {
            data: Buffer.from('Line1\r\nLine2\r\nLine3').toString('base64url'),
          },
        },
      },
    };

    const result = extractMetadata(inputEmail, 'security');

    expect(result.htmlContent).toBe('Line1 Line2 Line3');
    expect(result.htmlContent).not.toContain('\r\n');
  });

  it('should sanitize content by stripping escaped quotes', () => {
    const inputEmail: InputEmail = {
      id: 'msg-6',
      labelName: 'Input/Frontend',
      rawContent: {
        payload: {
          headers: [
            { name: 'From', value: 'quotes@example.com' },
            { name: 'Subject', value: 'Quotes Test' },
          ],
          body: {
            data: Buffer.from('Text with \\" escaped quotes').toString(
              'base64url'
            ),
          },
        },
      },
    };

    const result = extractMetadata(inputEmail, 'frontend');

    expect(result.htmlContent).toBe('Text with " escaped quotes');
    expect(result.htmlContent).not.toContain('\\"');
  });

  it('should truncate content to 2000 characters', () => {
    const longContent = 'a'.repeat(3000);
    const inputEmail: InputEmail = {
      id: 'msg-7',
      labelName: 'Input/Vue',
      rawContent: {
        payload: {
          headers: [
            { name: 'From', value: 'long@example.com' },
            { name: 'Subject', value: 'Long Content' },
          ],
          body: {
            data: Buffer.from(longContent).toString('base64url'),
          },
        },
      },
    };

    const result = extractMetadata(inputEmail, 'vue');

    expect(result.htmlContent.length).toBe(2000);
    expect(result.htmlContent).toBe('a'.repeat(2000));
  });

  it('should handle missing headers gracefully', () => {
    const inputEmail: InputEmail = {
      id: 'msg-8',
      labelName: 'Input/Architecture',
      rawContent: {
        payload: {
          headers: [],
          body: {
            data: Buffer.from('content').toString('base64url'),
          },
        },
      },
    };

    const result = extractMetadata(inputEmail, 'architecture');

    expect(result.sender).toBe('');
    expect(result.subject).toBe('');
    expect(result.htmlContent).toBe('content');
  });

  it('should return empty HTML when no body found', () => {
    const inputEmail: InputEmail = {
      id: 'msg-9',
      labelName: 'Input/Java',
      rawContent: {
        payload: {
          headers: [
            { name: 'From', value: 'nobody@example.com' },
            { name: 'Subject', value: 'No Body' },
          ],
        },
      },
    };

    const result = extractMetadata(inputEmail, 'java');

    expect(result.htmlContent).toBe('');
  });
});
