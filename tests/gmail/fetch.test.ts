import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchEmailsByLabel } from '../../src/gmail/fetch.js';
import type { InputEmail } from '../../src/types.js';
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

describe('fetchEmailsByLabel', () => {
  const mockList = vi.fn();
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(authModule.getGmailClient).mockReturnValue({
      users: {
        messages: {
          list: mockList,
          get: mockGet,
        },
      },
    } as never);
  });

  it('should return empty array when no emails found', async () => {
    mockList.mockResolvedValue({
      data: {
        messages: [],
      },
    });

    const result = await fetchEmailsByLabel('Java');

    expect(result).toEqual([]);
    expect(mockList).toHaveBeenCalledWith({
      userId: 'me',
      q: 'label:"Input/Java"',
      maxResults: 100,
    });
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('should fetch full message details for each email', async () => {
    mockList.mockResolvedValue({
      data: {
        messages: [
          { id: 'msg-1' },
          { id: 'msg-2' },
        ],
      },
    });

    mockGet
      .mockResolvedValueOnce({
        data: { id: 'msg-1', payload: { headers: [] } },
      })
      .mockResolvedValueOnce({
        data: { id: 'msg-2', payload: { headers: [] } },
      });

    const result = await fetchEmailsByLabel('Angular');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'msg-1',
      labelName: 'Input/Angular',
      rawContent: { id: 'msg-1', payload: { headers: [] } },
    });
    expect(result[1]).toEqual({
      id: 'msg-2',
      labelName: 'Input/Angular',
      rawContent: { id: 'msg-2', payload: { headers: [] } },
    });
    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(mockGet).toHaveBeenNthCalledWith(1, {
      userId: 'me',
      id: 'msg-1',
      format: 'full',
    });
    expect(mockGet).toHaveBeenNthCalledWith(2, {
      userId: 'me',
      id: 'msg-2',
      format: 'full',
    });
  });

  it('should construct correct query with domain', async () => {
    mockList.mockResolvedValue({
      data: {
        messages: [],
      },
    });

    await fetchEmailsByLabel('DevOps');

    expect(mockList).toHaveBeenCalledWith({
      userId: 'me',
      q: 'label:"Input/DevOps"',
      maxResults: 100,
    });
  });

  it('should handle undefined messages array', async () => {
    mockList.mockResolvedValue({
      data: {},
    });

    const result = await fetchEmailsByLabel('AI');

    expect(result).toEqual([]);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('should return InputEmail array with correct structure', async () => {
    mockList.mockResolvedValue({
      data: {
        messages: [{ id: 'test-id' }],
      },
    });

    mockGet.mockResolvedValue({
      data: {
        id: 'test-id',
        payload: {
          headers: [{ name: 'Subject', value: 'Test Email' }],
        },
      },
    });

    const result: InputEmail[] = await fetchEmailsByLabel('Security');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test-id');
    expect(result[0].labelName).toBe('Input/Security');
    expect(result[0].rawContent).toBeDefined();
  });
});
