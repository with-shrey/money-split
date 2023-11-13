import { NextFunction, Response, Request } from 'express';
import { RouteHandler } from 'base/http';
import { DependencyContainer } from 'business';
import { HTTP_STATUSES } from 'base/httpStatus';
import { AuthReq } from 'base/middleware/authentication-middleware';

const handle =
  ({ expenseService }: DependencyContainer) =>
  async (req: AuthReq<Request>, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return next(new Error('Something is wrong with userBalancesGetRequest handler setup'));
      }
      const balances = await expenseService.getBalances(req.user.id);
      return res.status(HTTP_STATUSES.OK).json(balances);
    } catch (error) {
      return next(error);
    }
  };

/**
 * @openapi
 * /api/user/me/balances:
 *   get:
 *     summary: Get balance outstanding for users
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
 *                 $ref: "#/components/schemas/BalanceModel"
 *       401:
 *         description: Authentication error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
export const getUserBalancesHandler: RouteHandler = (container) => ({
  middlewares: [],
  handle: handle(container),
});
