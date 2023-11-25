import { NextFunction, Request, Response } from 'express';
import { logger } from 'base/logger';

export function requestLoggerMiddleware(request: Request, response: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  const { method } = request;
  const url = request.originalUrl;
  const userAgent = request.get('User-Agent');
  const startTime = Date.now();

  logger.debug({
    message: 'incoming-request',
    timestamp,
    method,
    url,
  });
  response.on('finish', () => {
    const endTime = Date.now();
    const timeTaken = endTime - startTime;

    logger.info({
      message: 'responseLogger',
      timestamp,
      method,
      url,
      userAgent,
      timeTaken,
    });
  });

  next(); // Continue with the request
}
