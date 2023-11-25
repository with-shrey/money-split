import { NextFunction, Response, Request } from 'express';
import { RouteHandler } from 'base/http';
import { z } from 'zod';
import { DependencyContainer } from 'business';
import { AppError } from 'base/errors';
import { HTTP_STATUSES } from 'base/httpStatus';
import { AuthReq } from 'base/middleware/authentication-middleware';
import { validate } from 'base/validation';

const userExpenseGetRequest = z.object({
  userId: z.string().regex(/^\d+$/),
});

const handle =
  ({ expenseService }: DependencyContainer) =>
  async (req: AuthReq<Request>, res: Response, next: NextFunction) => {
    try {
      const validatedParams = await validate(userExpenseGetRequest, req.params);
      const userId = Number(validatedParams.userId);
      if (userId === req.user?.id) {
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
export const getUserExpensesHandler: RouteHandler = (container) => handle(container);
