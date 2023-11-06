import { z } from 'zod';
import { validate } from './validation';
import { ValidationError } from './errors';
import { HTTP_STATUSES } from './httpStatus';

describe('validate', () => {
  it('should return data if valid', () => {
    const schema = z.object({
      name: z.string().min(4).max(10),
    });
    const data = validate(schema, { name: 'John' });
    expect(data).toEqual({ name: 'John' });
  });

  it('should throw validation error if invlaid', () => {
    const schema = z.object({
      name: z.string(),
    });
    try {
      validate(schema, { nae: 'John' });
    } catch (error: any) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.fields).toEqual({
        name: {
          code: 'invalid_type',
          message: 'Required',
        },
      });
      expect(error.status).toBe(HTTP_STATUSES.UNPROCESSABLE_ENTITY);
    }
  });
});
