import { ValidationFields } from './errors';

export class ErrorResponse {
  public message: string;

  public fields?: ValidationFields;

  constructor(message: string, fields?: ValidationFields) {
    this.message = message;
    this.fields = fields;
  }
}
