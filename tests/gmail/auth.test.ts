import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getGmailClient } from '../../src/gmail/auth.js';

vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('dotenv', () => ({
  default: {
    config: vi.fn(),
  },
}));

vi.mock('googleapis', () => {
  const MockOAuth2 = class {
    setCredentials = vi.fn();
  };

  return {
    google: {
      auth: {
        OAuth2: MockOAuth2,
      },
      gmail: vi.fn().mockReturnValue({
        users: {
          messages: {
            list: vi.fn(),
          },
        },
      }),
    },
  };
});

describe('getGmailClient', () => {
  const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
    throw new Error(`process.exit(${code})`);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.GMAIL_CLIENT_ID;
    delete process.env.GMAIL_CLIENT_SECRET;
    delete process.env.GMAIL_REFRESH_TOKEN;
  });

  afterEach(() => {
    mockProcessExit.mockClear();
  });

  it('should throw error and exit when GMAIL_CLIENT_ID is missing', () => {
    process.env.GMAIL_CLIENT_SECRET = 'test-secret';
    process.env.GMAIL_REFRESH_TOKEN = 'test-token';

    expect(() => getGmailClient()).toThrow('process.exit(1)');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should throw error and exit when GMAIL_CLIENT_SECRET is missing', () => {
    process.env.GMAIL_CLIENT_ID = 'test-id';
    process.env.GMAIL_REFRESH_TOKEN = 'test-token';

    expect(() => getGmailClient()).toThrow('process.exit(1)');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should throw error and exit when GMAIL_REFRESH_TOKEN is missing', () => {
    process.env.GMAIL_CLIENT_ID = 'test-id';
    process.env.GMAIL_CLIENT_SECRET = 'test-secret';

    expect(() => getGmailClient()).toThrow('process.exit(1)');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should throw error and exit when all credentials are missing', () => {
    expect(() => getGmailClient()).toThrow('process.exit(1)');
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it('should create Gmail client successfully when all credentials are present', () => {
    process.env.GMAIL_CLIENT_ID = 'test-client-id';
    process.env.GMAIL_CLIENT_SECRET = 'test-client-secret';
    process.env.GMAIL_REFRESH_TOKEN = 'test-refresh-token';

    const client = getGmailClient();

    expect(client).toBeDefined();
    expect(client.users).toBeDefined();
    expect(mockProcessExit).not.toHaveBeenCalled();
  });
});
