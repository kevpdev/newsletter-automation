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
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
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
