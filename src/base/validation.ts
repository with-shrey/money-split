import { z } from 'zod';
import { ValidationError, ValidationFields } from './errors';

export function validate<T>(schema: z.Schema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.reduce<ValidationFields>(
        (errors, issue) => ({
          ...errors,
          [`${issue.path}`]: { code: issue.code, message: issue.message },
        }),
        {},
      );
      throw new ValidationError(fieldErrors);
    }
    throw error;
  }
}
