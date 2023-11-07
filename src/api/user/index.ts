import express from 'express';
import { postUsersCreateHandler } from './post-users-create-handler';
import { postUsersLoginHandler } from './post-user-login-handler';
import { DependencyContainer } from 'business';

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
  return router;
}
