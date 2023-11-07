import express from 'express';
import getUserRouter from './user';
import getExpenseRouter from './expense';
import { DependencyContainer } from 'business';
import { authenticationMiddleware } from 'base/middleware/authentication-middleware';

function getApiRouter(depContainer: DependencyContainer) {
  const apiRouter = express.Router();

  apiRouter.use('/user', getUserRouter(depContainer));
  apiRouter.use('/expense', authenticationMiddleware(depContainer), getExpenseRouter(depContainer));
  return apiRouter;
}

export default getApiRouter;
