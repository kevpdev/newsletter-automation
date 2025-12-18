import type { InputEmail } from '../types.js';
import { getGmailClient } from './auth.js';
import logger from '../logger.js';

export async function fetchEmailsByLabel(domain: string): Promise<InputEmail[]> {
  const gmail = getGmailClient();
  const labelName = `Input/${domain}`;

  try {
    // First, get the label ID from the label name
    logger.info(`Looking for label: ${labelName}`);
    const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
    const labels = labelsResponse.data.labels || [];
    const targetLabel = labels.find((label) => label.name === labelName);

    if (!targetLabel || !targetLabel.id) {
      logger.warn(`Label "${labelName}" not found`);
      return [];
    }

    logger.info(`Found label ID: ${targetLabel.id}`);

    // Use labelIds instead of q parameter to avoid metadata scope issue
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      labelIds: [targetLabel.id],
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
  } catch (error: unknown) {
    logger.error('❌ Erreur lors de la récupération des emails Gmail');
    logger.error(`Fonction: fetchEmailsByLabel (src/gmail/fetch.ts)`);

    if (error && typeof error === 'object') {
      if ('response' in error) {
        const apiError = error as { response?: { data?: { error?: string; error_description?: string } } };
        if (apiError.response?.data) {
          logger.error(`Type: ${apiError.response.data.error}`);
          logger.error(`Description: ${apiError.response.data.error_description}`);
        }
      }

      if ('stack' in error && typeof error.stack === 'string') {
        logger.error('Stack trace:');
        logger.error(error.stack);
      }
    }

    throw error;
  }
}
