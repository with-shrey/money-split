import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from 'base/validation';

export type ValidatedRequest<T> = Request & {
  validatedBody?: T;
  validatedParams?: T;
};

export const makeValidationMiddleware =
  <T>(schema: z.Schema<T>, validatePart: 'body' | 'params') =>
  (request: ValidatedRequest<T>, response: Response, next: NextFunction) => {
    try {
      const data = validate(schema, request[validatePart]);

      if (validatePart === 'body') {
        request.validatedBody = data;
        next();
        return;
      }
      request.validatedParams = data;
      next();
    } catch (error) {
      next(error);
    }
  };
