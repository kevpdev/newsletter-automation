import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendEmail } from '../../src/gmail/send.js';
import type { OutputEmail } from '../../src/types.js';
import * as authModule from '../../src/gmail/auth.js';

vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('../../src/gmail/auth.js', () => ({
  getGmailClient: vi.fn(),
}));

describe('sendEmail', () => {
  const mockSend = vi.fn();
  const mockModify = vi.fn();
  const mockLabelsList = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(authModule.getGmailClient).mockReturnValue({
      users: {
        messages: {
          send: mockSend,
          modify: mockModify,
        },
        labels: {
          list: mockLabelsList,
        },
      },
    } as never);

    // Mock labels list response by default
    mockLabelsList.mockResolvedValue({
      data: {
        labels: [
          { id: 'label-java', name: 'Output/Java' },
          { id: 'label-angular', name: 'Output/Angular' },
          { id: 'label-devops', name: 'Output/DevOps' },
          { id: 'label-security', name: 'Output/Security' },
          { id: 'label-frontend', name: 'Output/Frontend' },
          { id: 'label-vue', name: 'Output/Vue' },
          { id: 'label-architecture', name: 'Output/Architecture' },
        ],
      },
    });
  });

  it('should send email with correct MIME format', async () => {
    const output: OutputEmail = {
      to: 'user@example.com',
      subject: 'Test Subject',
      htmlBody: '<h1>Test Content</h1>',
      outputLabel: 'Output/Java',
    };

    mockSend.mockResolvedValue({ data: { id: 'sent-msg-123' } });
    mockModify.mockResolvedValue({});

    await sendEmail(output);

    expect(mockSend).toHaveBeenCalledOnce();
    const sendCall = mockSend.mock.calls[0][0];

    expect(sendCall.userId).toBe('me');
    expect(sendCall.requestBody.raw).toBeDefined();

    const decodedMessage = Buffer.from(
      sendCall.requestBody.raw
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(
          sendCall.requestBody.raw.length +
            ((4 - (sendCall.requestBody.raw.length % 4)) % 4),
          '='
        ),
      'base64'
    ).toString('utf-8');

    expect(decodedMessage).toContain('To: user@example.com');
    expect(decodedMessage).toContain('Subject: Test Subject');
    expect(decodedMessage).toContain('Content-Type: text/html; charset="UTF-8"');
    expect(decodedMessage).toContain('<h1>Test Content</h1>');
  });

  it('should apply output label to sent email', async () => {
    const output: OutputEmail = {
      to: 'user@example.com',
      subject: 'Test',
      htmlBody: '<p>Content</p>',
      outputLabel: 'Output/Angular',
    };

    mockSend.mockResolvedValue({ data: { id: 'sent-msg-456' } });
    mockModify.mockResolvedValue({});

    await sendEmail(output);

    expect(mockModify).toHaveBeenCalledOnce();
    expect(mockModify).toHaveBeenCalledWith({
      userId: 'me',
      id: 'sent-msg-456',
      requestBody: {
        addLabelIds: ['label-angular'],
        removeLabelIds: ['INBOX'],
      },
    });
  });

  it('should send email before applying label', async () => {
    const output: OutputEmail = {
      to: 'test@test.com',
      subject: 'Order Test',
      htmlBody: '<div>Test</div>',
      outputLabel: 'Output/DevOps',
    };

    const callOrder: string[] = [];

    mockSend.mockImplementation(() => {
      callOrder.push('send');
      return Promise.resolve({ data: { id: 'sent-msg-789' } });
    });

    mockModify.mockImplementation(() => {
      callOrder.push('modify');
      return Promise.resolve({});
    });

    await sendEmail(output);

    expect(callOrder).toEqual(['send', 'modify']);
  });

  it('should handle special characters in subject', async () => {
    const output: OutputEmail = {
      to: 'special@example.com',
      subject: 'Test: "Quotes" & <Tags>',
      htmlBody: '<p>Content</p>',
      outputLabel: 'Output/Security',
    };

    mockSend.mockResolvedValue({ data: { id: 'sent-msg-special' } });
    mockModify.mockResolvedValue({});

    await sendEmail(output);

    expect(mockSend).toHaveBeenCalledOnce();
    const sendCall = mockSend.mock.calls[0][0];
    expect(sendCall.requestBody.raw).toBeDefined();
  });

  it('should encode base64url correctly (no + / =)', async () => {
    const output: OutputEmail = {
      to: 'encode@test.com',
      subject: 'Base64 Test',
      htmlBody: '<p>Test content with special chars: >>>???</p>',
      outputLabel: 'Output/Frontend',
    };

    mockSend.mockResolvedValue({ data: { id: 'sent-msg-encode' } });
    mockModify.mockResolvedValue({});

    await sendEmail(output);

    const sendCall = mockSend.mock.calls[0][0];
    const encoded = sendCall.requestBody.raw;

    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toMatch(/=+$/);
  });

  it('should throw error if send fails', async () => {
    const output: OutputEmail = {
      to: 'fail@example.com',
      subject: 'Fail Test',
      htmlBody: '<p>Content</p>',
      outputLabel: 'Output/Vue',
    };

    mockSend.mockRejectedValue(new Error('Send failed'));

    await expect(sendEmail(output)).rejects.toThrow('Send failed');

    expect(mockModify).not.toHaveBeenCalled();
  });

  it('should throw error if label not found', async () => {
    const output: OutputEmail = {
      to: 'label-fail@example.com',
      subject: 'Label Not Found Test',
      htmlBody: '<p>Content</p>',
      outputLabel: 'Output/Unknown',
    };

    mockSend.mockResolvedValue({ data: { id: 'sent-msg-unknown' } });

    await expect(sendEmail(output)).rejects.toThrow(
      'Label "Output/Unknown" not found'
    );

    expect(mockModify).not.toHaveBeenCalled();
  });
});
