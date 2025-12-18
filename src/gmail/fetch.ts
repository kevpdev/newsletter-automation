import type { InputEmail } from '../types.js';
import { getGmailClient } from './auth.js';
import logger from '../logger.js';

export async function fetchEmailsByLabel(domain: string): Promise<InputEmail[]> {
  const gmail = getGmailClient();
  const query = `label:"Input/${domain}"`;

  const listResponse = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 100,
  });

  const messages = listResponse.data.messages || [];

  if (messages.length === 0) {
    logger.info(`No emails found for domain: ${domain}`);
    return [];
  }

  const inputEmails: InputEmail[] = [];

  for (const message of messages) {
    const fullMessage = await gmail.users.messages.get({
      userId: 'me',
      id: message.id!,
      format: 'full',
    });

    inputEmails.push({
      id: message.id!,
      labelName: `Input/${domain}`,
      rawContent: fullMessage.data,
    });
  }

  logger.info(`Fetched ${inputEmails.length} emails for domain: ${domain}`);

  return inputEmails;
}
