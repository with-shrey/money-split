import { Response, NextFunction, Request } from 'express';
import { RouteHandler } from 'base/http';
import { z } from 'zod';
import { DependencyContainer } from 'business';
import { HTTP_STATUSES } from 'base/httpStatus';
import { UserAlreadyExistError } from 'business/user/user-service';
import { ValidationError } from 'base/errors';
import { validate } from 'base/validation';

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

const handle =
  ({ userService }: DependencyContainer) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedBody = validate(userCreateRequestSchema, req.body);
      const { name, phone } = validatedBody;
      const users = await userService.createUser(name, phone);
      return res.status(HTTP_STATUSES.CREATED).json(users);
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
 *       - Authentication
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
export const postUsersCreateHandler: RouteHandler = (container) => handle(container);
