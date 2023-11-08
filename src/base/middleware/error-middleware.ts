import { NextFunction, Request, Response } from 'express';
import { AppError, HttpError, ValidationError } from 'base/errors';
import { HTTP_STATUSES } from 'base/httpStatus';
import { ErrorResponse } from 'base/http';
import { logger } from 'base/logger';

export function apiErrorMiddleware(
  error: Error,
  request: Request,
  response: Response,
  _: NextFunction,
) {
  logger.error({
    message: 'Error occurred in serving API request',
    path: request.path,
    method: request.method,
    error,
  });
  // eslint-disable-next-line no-console
  console.error(error);

  if (error instanceof HttpError) {
    return response
      .status(error.status ?? HTTP_STATUSES.INTERNAL_SERVER_ERROR)
      .json(
        new ErrorResponse(
          error.message,
          error instanceof ValidationError ? error.fields : undefined,
        ),
      );
  }

  if (error instanceof AppError) {
    return response.status(HTTP_STATUSES.BAD_REQUEST).json(new ErrorResponse(error.message));
  }

  return response
    .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR)
    .json(new ErrorResponse('Internal Server Error'));
}
