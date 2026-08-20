import winston from 'winston';
import { config } from '../../config/environment.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const customFormat = printf((info) => {
  const { level, message, timestamp: ts, stack, ...meta } = info;
  let log = ts + ' [' + level + ']: ' + message;
  
  const metaKeys = Object.keys(meta);
  if (metaKeys.length > 0) {
    log += ' ' + JSON.stringify(meta);
  }
  
  if (stack) {
    log += '\n' + stack;
  }
  
  return log;
});

const developmentFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  customFormat
);

const productionFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: config.logging.level,
  format: config.app.isProduction ? productionFormat : developmentFormat,
  transports: [
    new winston.transports.Console(),
  ],
  exceptionHandlers: [
    new winston.transports.Console(),
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
  ],
});

// Add file transports in production
if (config.app.isProduction) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Stream for Morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
