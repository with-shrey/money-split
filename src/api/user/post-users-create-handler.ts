import { Response, NextFunction } from 'express';
import { RouteHandler } from 'base/http';
import { z } from 'zod';
import { ValidatedRequest, makeValidationMiddleware } from 'base/middleware/validation-middleware';
import { DependencyContainer } from 'business';
import { HTTP_STATUSES } from 'base/httpStatus';
import { UserAlreadyExistError } from 'business/user/user-service';
import { ValidationError } from 'base/errors';

/**
 * @openapi
 * components:
 *   schemas:
 *     UserCreateRequest:
 *       description: Product model
 *       required:
 *         - phone
 *         - name
 *       properties:
 *         phone:
 *           type: string
 *           description: phone of user
 *         name:
 *           type: string
 *           description: Full name of User
 *           maxLength: 50
 */

const userCreateRequestSchema = z.object({
  phone: z.string().min(10).max(10).regex(/^\d+$/, 'phone must be numeric'),
  name: z.string().min(1).max(50),
});

type UserCreateRequest = z.infer<typeof userCreateRequestSchema>;

const handle =
  ({ userService }: DependencyContainer) =>
  async (req: ValidatedRequest<UserCreateRequest>, res: Response, next: NextFunction) => {
    try {
      if (!req.validatedBody) {
        return next(new Error('No validated body'));
      }
      const { name, phone } = req.validatedBody;
      const users = await userService.createUser(name, phone);
      return res.status(HTTP_STATUSES.CREATED).send(users);
    } catch (error) {
      if (error instanceof UserAlreadyExistError) {
        return next(
          new ValidationError({
            phone: {
              code: 'duplicate',
              message: error.message,
            },
          }),
        );
      }
      return next(error);
    }
  };

/**
 * @openapi
 * /api/user/create:
 *   post:
 *     summary: Create a user with 5 sample users
 *     tags:
 *       - User
 *     requestBody:
 *       description: User object
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UserCreateRequest"
 *     responses:
 *       201:
 *         description: Users created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/User"
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
export const postUsersCreateHandler: RouteHandler = (container) => ({
  middlewares: [makeValidationMiddleware(userCreateRequestSchema, 'body')],
  handle: handle(container),
});
