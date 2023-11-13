import { NextFunction, Request, Response } from 'express';
import { logger } from 'base/logger';

export function requestLoggerMiddleware(request: Request, response: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  const { method } = request;
  const url = request.originalUrl;
  const userAgent = request.get('User-Agent');
  const startTime = Date.now();

  logger.info({
    message: 'requestLogger',
    timestamp,
    method,
    url,
    userAgent,
  });
  response.on('finish', () => {
    const endTime = Date.now();
    const timeTaken = endTime - startTime;

    logger.info({
      message: 'responseLogger',
      method,
      url,
      timeTaken,
    });
  });

  next(); // Continue with the request
}
