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
 * @param labelName - Name of the label (e.g., "Output/Java")
 * @returns Label ID or null if not found
 */
async function getLabelId(labelName: string): Promise<string | null> {
  const gmail = getGmailClient();
  const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
  const labels = labelsResponse.data.labels || [];
  const targetLabel = labels.find((label) => label.name === labelName);
  return targetLabel?.id || null;
}

/**
 * Sends tech watch email to user and applies output label.
 * Simplified for proactive tech watch (no input emails to process).
 *
 * @param output - Email to send with subject, body, and output label
 * @throws Error if label not found or send fails
 *
 * @example
 * await sendEmail({
 *   to: 'user@example.com',
 *   subject: '[Java] Tech Watch - Week 12',
 *   htmlBody: '<html>...',
 *   outputLabel: 'Output/Java'
 * });
 */
export async function sendEmail(output: OutputEmail): Promise<void> {
  const gmail = getGmailClient();

  const mimeMessage = createMimeMessage(output);
  const encodedMessage = encodeBase64Url(mimeMessage);

  const sendResponse = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });

  const sentMessageId = sendResponse.data.id;
  if (!sentMessageId) {
    throw new Error('Failed to get sent message ID from Gmail API');
  }

  logger.info(`Sent tech watch email: ${output.subject}`);

  // Get the output label ID (e.g., "Output/Java")
  const outputLabelId = await getLabelId(output.outputLabel);
  if (!outputLabelId) {
    throw new Error(
      `Label "${output.outputLabel}" not found. Please create it in Gmail.`
    );
  }

  // Apply output label to sent message
  await gmail.users.messages.modify({
    userId: 'me',
    id: sentMessageId,
    requestBody: {
      addLabelIds: [outputLabelId],
      removeLabelIds: ['INBOX'],
    },
  });

  logger.info(`Applied label "${output.outputLabel}" to sent email: ${sentMessageId}`);
}
