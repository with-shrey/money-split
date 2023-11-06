import winston from 'winston';
import { env } from 'config/env';

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.json(), // Use JSON format
  transports: [new winston.transports.Console()],
});
