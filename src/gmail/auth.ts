import { google } from 'googleapis';
import type { gmail_v1 } from 'googleapis';
import dotenv from 'dotenv';
import logger from '../logger.js';

dotenv.config();

export function getGmailClient(): gmail_v1.Gmail {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    logger.error('Gmail credentials missing in .env file');
    logger.error('Required: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN');
    process.exit(1);
  }

  logger.info(`Debug - Refresh token used (first 30 chars): ${refreshToken.substring(0, 30)}...`);
  logger.info(`Debug - Client ID (first 20 chars): ${clientId.substring(0, 20)}...`);

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost');

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  // Force token refresh to ensure we get fresh credentials with correct scopes
  oauth2Client.on('tokens', (tokens) => {
    logger.info('✅ New access token obtained');
    if (tokens.scope) {
      logger.info(`Scopes: ${tokens.scope}`);
    }
  });

  const gmail = google.gmail({
    version: 'v1',
    auth: oauth2Client,
  });

  logger.info('Gmail client initialized successfully');

  return gmail;
}
