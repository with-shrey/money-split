import { NextFunction, Response } from 'express';
import { RouteHandler } from 'base/http';
import { z } from 'zod';
import { ValidatedRequest, makeValidationMiddleware } from 'base/middleware/validation-middleware';
import { DependencyContainer } from 'business';
import { AppError } from 'base/errors';
import { HTTP_STATUSES } from 'base/httpStatus';
import { AuthReq } from 'base/middleware/authentication-middleware';

const userExpenseGetRequest = z.object({
  userId: z.string().regex(/^\d+$/),
});

type UserExpenseGetRequest = z.infer<typeof userExpenseGetRequest>;

const handle =
  ({ expenseService }: DependencyContainer) =>
  async (
    req: AuthReq<ValidatedRequest<UserExpenseGetRequest>>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.validatedParams || !req.user || !req.user.id) {
        return next(new Error('Something is wrong with userExpenseGetRequest handler setup'));
      }
      const userId = Number(req.validatedParams.userId);
      if (userId === req.user.id) {
        throw new AppError('userId cannot be same as curret user');
      }
      const expenses = await expenseService.getExpenses(userId, req.user.id);
      return res.status(HTTP_STATUSES.OK).json(expenses);
    } catch (error) {
      return next(error);
    }
  };

/**
 * @openapi
 * /api/user/{userId}/expenses:
 *   get:
 *     summary: Get Expenses between current user and userId
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique id of the user
 *     security:
 *       - bearerAuth : []
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Expense"
 *       401:
 *         description: Authentication error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
export const getUserExpensesHandler: RouteHandler = (container) => ({
  middlewares: [makeValidationMiddleware(userExpenseGetRequest, 'params')],
  handle: handle(container),
});
