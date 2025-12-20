import winston from 'winston';

const redactSensitive = winston.format((info) => {
  const sensitivePatterns = [
    /API_KEY[=:\s]+[^\s]+/gi,
    /TOKEN[=:\s]+[^\s]+/gi,
    /REFRESH_TOKEN[=:\s]+[^\s]+/gi,
    /CLIENT_SECRET[=:\s]+[^\s]+/gi,
    /SECRET[=:\s]+[^\s]+/gi,
    /PASSWORD[=:\s]+[^\s]+/gi,
  ];

  if (typeof info.message === 'string') {
    let message = info.message;
    sensitivePatterns.forEach((pattern) => {
      message = message.replace(pattern, (match: string) => {
        const prefix = match.split(/[=:\s]/)[0];
        return `${prefix}=[REDACTED]`;
      });
    });
    info.message = message;
  }

  return info;
});

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...metadata } = info;

    // Remove Winston's internal Symbol properties
    const cleanMetadata = Object.keys(metadata)
      .filter((key) => typeof key === 'string')
      .reduce((acc, key) => {
        acc[key] = metadata[key];
        return acc;
      }, {} as Record<string, unknown>);

    const metaStr = Object.keys(cleanMetadata).length
      ? '\n' + JSON.stringify(cleanMetadata, null, 2)
      : '';

    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

const fileFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(redactSensitive(), winston.format.errors({ stack: true })),
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: 'logs/app.log',
      format: fileFormat,
    }),
  ],
});

export default logger;
