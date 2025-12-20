import type { OutputEmail } from '../types.js';
import { getGmailClient } from './auth.js';
import logger from '../logger.js';

function createMimeMessage(output: OutputEmail): string {
  const lines = [
    `To: ${output.to}`,
    `Subject: ${output.subject}`,
    'Content-Type: text/html; charset="UTF-8"',
    'MIME-Version: 1.0',
    '',
    output.htmlBody,
  ];
  return lines.join('\r\n');
}

function encodeBase64Url(text: string): string {
  return Buffer.from(text)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Get label ID from label name.
 * @param labelName - Name of the label (e.g., "Processed")
 * @returns Label ID or null if not found
 */
async function getLabelId(labelName: string): Promise<string | null> {
  const gmail = getGmailClient();
  const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
  const labels = labelsResponse.data.labels || [];
  const targetLabel = labels.find((label) => label.name === labelName);
  return targetLabel?.id || null;
}

export async function sendProcessedEmail(output: OutputEmail, originalId: string): Promise<void> {
  const gmail = getGmailClient();

  const mimeMessage = createMimeMessage(output);
  const encodedMessage = encodeBase64Url(mimeMessage);

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });

  logger.info(`Sent processed email: ${output.subject}`);

  // Get the "Processed" label ID
  const processedLabelId = await getLabelId('Processed');
  if (!processedLabelId) {
    throw new Error('Label "Processed" not found. Please create it in Gmail.');
  }

  await gmail.users.messages.modify({
    userId: 'me',
    id: originalId,
    requestBody: {
      addLabelIds: [processedLabelId],
    },
  });

  logger.info(`Marked original email as Processed: ${originalId}`);
}
