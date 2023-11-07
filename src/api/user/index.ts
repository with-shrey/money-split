import express from 'express';
import { postUsersCreateHandler } from './post-users-create-handler';
import { postUsersLoginHandler } from './post-user-login-handler';
import { DependencyContainer } from 'business';
import { authenticationMiddleware } from 'base/middleware/authentication-middleware';
import { getUserExpensesHandler } from './get-user-expenses-handler';
import { getUserBalancesHandler } from './get-user-balances-handler';

export default function getUserRouter(depContainer: DependencyContainer) {
  const router = express.Router();

  router.post(
    '/create',
    postUsersCreateHandler(depContainer).middlewares,
    postUsersCreateHandler(depContainer).handle,
  );
  router.post(
    '/login',
    postUsersLoginHandler(depContainer).middlewares,
    postUsersLoginHandler(depContainer).handle,
  );

  router.use(authenticationMiddleware(depContainer));

  router.get(
    '/:userId/expenses',
    getUserExpensesHandler(depContainer).middlewares,
    getUserExpensesHandler(depContainer).handle,
  );

  router.get(
    '/me/balances',
    getUserBalancesHandler(depContainer).middlewares,
    getUserBalancesHandler(depContainer).handle,
  );

  return router;
}
