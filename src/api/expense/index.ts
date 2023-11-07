import express from 'express';
import { DependencyContainer } from 'business';
import { postExpenseHandler } from './post-expense-handler';

export default function getExpenseRouter(depContainer: DependencyContainer) {
  const router = express.Router();

  router.post(
    '/',
    postExpenseHandler(depContainer).middlewares,
    postExpenseHandler(depContainer).handle,
  );

  return router;
}
