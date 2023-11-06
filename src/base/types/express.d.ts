import { Request } from 'express';
import { ValidatedRequest } from 'base/middleware/validation-middleware';

declare global {
  namespace Express {
    interface Request {
      validatedBody?: ValidatedRequest;
      validatedParams?: ValidatedRequest;
    }
  }
}
