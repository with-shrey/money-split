import { HTTP_STATUSES } from './httpStatus';

// This is a trusted error type
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
    };
  }
}

export class HttpError extends AppError {
  constructor(
    public message: string,
    public status: number,
  ) {
    super(message);
    this.status = status;
    this.name = 'HttpError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      status: this.status,
    };
  }
}

export type ValidationFields = {
  [field: string]: { code: string; message?: string };
};

export class ValidationError extends HttpError {
  constructor(public fields: ValidationFields = {}) {
    super('Validation Error', HTTP_STATUSES.UNPROCESSABLE_ENTITY);
    this.fields = fields;
    this.name = 'ValidationError';
  }

  toJSON() {
    return {
      ...super.toJSON(),
      fields: this.fields,
    };
  }
}
