import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from 'base/validation';

export type ValidatedRequest<T> = Request & {
  validatedBody: T;
};

export const makeValidationMiddleware =
  <T>(schema: z.Schema<T>, validatePart: 'body' | 'params') =>
  (request: Request, response: Response, next: NextFunction) => {
    try {
      const data = validate(schema, request[validatePart]);

      if (validatePart === 'body') {
        request.validatedBody = data;
        return;
      }
      request.validatedParams = data;
    } catch (error) {
      next(error);
    }
  };
