import { DependencyContainer } from 'business';
import { ValidationFields } from './errors';
import express, { NextFunction } from 'express';

/**
 * @openapi
 * components:
 *   schemas:
 *     ValidationFields:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *         message:
 *           type: string
 *       required:
 *         - code
 *         - message
 *       example:
 *         field1:
 *           code: "invalid_enum_value"
 *           message: "Validation error 1"
 *
 *     ErrorResponse:
 *       description: HTTP Error Response
 *       required:
 *         - error
 *       properties:
 *         error:
 *           type: string
 *           description: Error code or message
 *         fields:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/ValidationFields"
 */

export class ErrorResponse {
  public message: string;

  public fields?: ValidationFields;

  constructor(message: string, fields?: ValidationFields) {
    this.message = message;
    this.fields = fields;
  }

  toJSON() {
    return {
      error: this.message,
      fields: this.fields,
    };
  }
}

export type RouteHandler = (_: DependencyContainer) => {
  handle: express.RequestHandler;
  middlewares: express.RequestHandler[];
};

export abstract class JSONRouteHandler {
  abstract middlewares: express.RequestHandler[];

  constructor(public container: DependencyContainer) {
    this.container = container;
  }

  handler = async (request: express.Request, response: express.Response, next: NextFunction) => {
    try {
      await this.handle(this.container, request, response);
    } catch (error) {
      next(error);
    }
  };

  abstract handle(
    container: DependencyContainer,
    request: express.Request,
    response: express.Response,
  ): void;

}
