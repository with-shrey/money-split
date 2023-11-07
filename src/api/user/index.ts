import express from 'express';
import { postUsersCreateHandler } from './post-users-create-handler';
import { postUsersLoginHandler } from './post-user-login-handler';
import { DependencyContainer } from 'business';
import { authenticationMiddleware } from 'base/middleware/authentication-middleware';

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

  router.post(
    '/:userId/expenses',
    postUsersLoginHandler(depContainer).middlewares,
    postUsersLoginHandler(depContainer).handle,
  );

  router.post(
    '/:userId/balances',
    postUsersLoginHandler(depContainer).middlewares,
    postUsersLoginHandler(depContainer).handle,
  );

  return router;
}
