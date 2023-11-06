import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'base/errors';
import { HTTP_STATUSES } from 'base/httpStatus';

export function notFoundMiddleware(request: Request, response: Response, next: NextFunction) {
  const httpError = new HttpError(
    `resource_not_found - ${request.method} ${request.originalUrl}`,
    HTTP_STATUSES.NOT_FOUND,
  );
  next(httpError);
}
