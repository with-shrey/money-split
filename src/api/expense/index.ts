import express from 'express';
import { DependencyContainer } from 'business';
import { PostExpenseHandler } from './post-expense-handler';

export default function getExpenseRouter(depContainer: DependencyContainer) {
  const router = express.Router();

  const postExpenseHandler = new PostExpenseHandler(depContainer);
  router.post('/', postExpenseHandler.middlewares, postExpenseHandler.handler);

  return router;
}
