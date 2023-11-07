import { NextFunction, Response } from 'express';
import { RouteHandler } from 'base/http';
import { z } from 'zod';
import { ValidatedRequest, makeValidationMiddleware } from 'base/middleware/validation-middleware';
import { DependencyContainer } from 'business';
import { AuthError } from 'business/user/user-service';
import { HttpError } from 'base/errors';
import { HTTP_STATUSES } from 'base/httpStatus';
import { AuthReq } from '../../base/middleware/authentication-middleware';
/**
 * @openapi
 * components:
 *   schemas:
 *     ExpenseCreateRequest:
 *       type: object
 *       properties:
 *         splitType:
 *           type: string
 *           enum:
 *             - equal
 *             - percentage
 *         name:
 *           type: string
 *           maxLength: 50
 *         amount:
 *           type: number
 *           minimum: 0
 *         paidBy:
 *           type: number
 *           minimum: 0
 *         splits:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: number
 *                 minimum: 0
 *               split:
 *                 type: number
 *                 minimum: 0
 *       required:
 *         - splitType
 *         - name
 *         - amount
 *         - paidBy
 *         - splits
 */

const expenseCreateRequestSchema = z.object({
  splitType: z.string().refine((value) => ['equal', 'percentage'].includes(value), {
    message: 'Invalid value. Must be one of: option1, option2, option3',
  }),
  name: z.string().max(50),
  amount: z.number().positive(),
  paidBy: z.number().positive(),
  splits: z.array(z.object({ userId: z.number().positive(), split: z.number().positive() })),
});

type ExpenseCreateRequest = z.infer<typeof expenseCreateRequestSchema>;

const handle =
  ({ expenseService }: DependencyContainer) =>
  async (
    req: AuthReq<ValidatedRequest<ExpenseCreateRequest>>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.validatedBody) {
        return next(new Error('No validated body'));
      }
      const { splits, splitType } = req.validatedBody;
      const expense = await expenseService.createExpense(
        {
          ...req.validatedBody,
          splitType: splitType as 'equal' | 'percentage',
          groupId: req.user?.groupId,
        },
        splits,
      );
      return res.status(200).send(expense);
    } catch (error) {
      if (error instanceof AuthError) {
        return next(new HttpError(error.message, HTTP_STATUSES.UNAUTHORIZED));
      }
      return next(error);
    }
  };

/**
 * @openapi
 * /api/expense:
 *   post:
 *     summary: Create Expense
 *     security:
 *       - bearerAuth : []
 *     tags:
 *       - Expense
 *     requestBody:
 *       description: expense details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ExpenseCreateRequest"
 *     responses:
 *       200:
 *         description: created successfully
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
export const postExpenseHandler: RouteHandler = (container) => ({
  middlewares: [makeValidationMiddleware(expenseCreateRequestSchema, 'body')],
  handle: handle(container),
});
