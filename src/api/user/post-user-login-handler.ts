import { NextFunction, Response } from 'express';
import { RouteHandler } from 'base/http';
import { z } from 'zod';
import { ValidatedRequest, makeValidationMiddleware } from 'base/middleware/validation-middleware';
import { DependencyContainer } from 'business';
import { AuthError } from 'business/user/user-service';
import { HttpError } from 'base/errors';
import { HTTP_STATUSES } from 'base/httpStatus';
/**
 * @openapi
 * components:
 *   schemas:
 *     UserLoginRequest:
 *       description: Product model
 *       required:
 *         - phone
 *       properties:
 *         phone:
 *           type: string
 *           description: phone of user
 *           maxLength: 10
 */

const userLoginRequestSchema = z.object({
  phone: z.string().max(10).min(10),
});

type UserLoginRequest = z.infer<typeof userLoginRequestSchema>;

/**
 * @openapi
 * components:
 *   schemas:
 *     UserLoginResponse:
 *       description: token model
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *         prefix:
 *           type: string
 *           description: Bearer
 */

type LoginResponse = {
  token: string;
  prefix: string;
};
const handle =
  ({ userService }: DependencyContainer) =>
  async (req: ValidatedRequest<UserLoginRequest>, res: Response, next: NextFunction) => {
    try {
      if (!req.validatedBody) {
        return next(new Error('No validated body'));
      }
      const token = await userService.createToken(req.validatedBody.phone);
      return res.status(200).json({ token, prefix: 'Bearer' } as LoginResponse);
    } catch (error) {
      if (error instanceof AuthError) {
        return next(new HttpError(error.message, HTTP_STATUSES.UNAUTHORIZED));
      }
      return next(error);
    }
  };

/**
 * @openapi
 * /api/user/login:
 *   post:
 *     summary: Login user by phone
 *     tags:
 *       - Authentication
 *       - User
 *     requestBody:
 *       description: phone of user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UserLoginRequest"
 *     responses:
 *       200:
 *         description: logi successful
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/User"
 *       401:
 *         description: Authentication error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
export const postUsersLoginHandler: RouteHandler = (container) => ({
  middlewares: [makeValidationMiddleware(userLoginRequestSchema, 'body')],
  handle: handle(container),
});
