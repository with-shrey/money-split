import express from 'express';
import getUserRouter from './user';
// import expenseRouter from './expense';
import { DependencyContainer } from 'business';

function getApiRouter(depContainer: DependencyContainer) {
  const apiRouter = express.Router();

  apiRouter.use('/user', getUserRouter(depContainer));
  // apiRouter.use('/expense', expenseRouter);
  return apiRouter;
}

export default getApiRouter;
