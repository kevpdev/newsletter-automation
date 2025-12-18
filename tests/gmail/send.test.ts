import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendProcessedEmail } from '../../src/gmail/send.js';
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

describe('sendProcessedEmail', () => {
  const mockSend = vi.fn();
  const mockModify = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(authModule.getGmailClient).mockReturnValue({
      users: {
        messages: {
          send: mockSend,
          modify: mockModify,
        },
      },
    } as never);
  });

  it('should send email with correct MIME format', async () => {
    const output: OutputEmail = {
      to: 'user@example.com',
      subject: 'Test Subject',
      htmlBody: '<h1>Test Content</h1>',
      outputLabel: 'Output/Java',
    };

    mockSend.mockResolvedValue({});
    mockModify.mockResolvedValue({});

    await sendProcessedEmail(output, 'original-id-123');

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

  it('should modify original email with Processed label', async () => {
    const output: OutputEmail = {
      to: 'user@example.com',
      subject: 'Test',
      htmlBody: '<p>Content</p>',
      outputLabel: 'Output/Angular',
    };

    mockSend.mockResolvedValue({});
    mockModify.mockResolvedValue({});

    await sendProcessedEmail(output, 'msg-456');

    expect(mockModify).toHaveBeenCalledOnce();
    expect(mockModify).toHaveBeenCalledWith({
      userId: 'me',
      id: 'msg-456',
      requestBody: {
        addLabelIds: ['Processed'],
      },
    });
  });

  it('should send email before modifying original', async () => {
    const output: OutputEmail = {
      to: 'test@test.com',
      subject: 'Order Test',
      htmlBody: '<div>Test</div>',
      outputLabel: 'Output/DevOps',
    };

    const callOrder: string[] = [];

    mockSend.mockImplementation(() => {
      callOrder.push('send');
      return Promise.resolve({});
    });

    mockModify.mockImplementation(() => {
      callOrder.push('modify');
      return Promise.resolve({});
    });

    await sendProcessedEmail(output, 'msg-789');

    expect(callOrder).toEqual(['send', 'modify']);
  });

  it('should handle special characters in subject', async () => {
    const output: OutputEmail = {
      to: 'special@example.com',
      subject: 'Test: "Quotes" & <Tags>',
      htmlBody: '<p>Content</p>',
      outputLabel: 'Output/Security',
    };

    mockSend.mockResolvedValue({});
    mockModify.mockResolvedValue({});

    await sendProcessedEmail(output, 'msg-special');

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

    mockSend.mockResolvedValue({});
    mockModify.mockResolvedValue({});

    await sendProcessedEmail(output, 'msg-encode');

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

    await expect(sendProcessedEmail(output, 'msg-fail')).rejects.toThrow(
      'Send failed'
    );

    expect(mockModify).not.toHaveBeenCalled();
  });

  it('should throw error if modify fails', async () => {
    const output: OutputEmail = {
      to: 'modify-fail@example.com',
      subject: 'Modify Fail Test',
      htmlBody: '<p>Content</p>',
      outputLabel: 'Output/Architecture',
    };

    mockSend.mockResolvedValue({});
    mockModify.mockRejectedValue(new Error('Modify failed'));

    await expect(
      sendProcessedEmail(output, 'msg-modify-fail')
    ).rejects.toThrow('Modify failed');
  });
});
