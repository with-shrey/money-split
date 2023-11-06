import { NextFunction, Request, Response } from 'express';
import { logger } from 'base/logger';

export function requestLoggerMiddleware(request: Request, response: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  const { method } = request;
  const url = request.originalUrl;
  const userAgent = request.get('User-Agent');

  logger.info({
    message: 'requestLogger',
    timestamp,
    method,
    url,
    userAgent,
  });

  next(); // Continue with the request
}
