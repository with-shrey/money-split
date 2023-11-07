import { Pool } from 'pg';
import { DBUserRepository } from './user/user-repository';
import { DBExpenseRepository } from './expense/expense-repository';

type DependencyArgs = {
  db: Pool;
};

export function createRepositories(args: DependencyArgs) {
  const userRepository = new DBUserRepository(args.db);
  const expenseRepository = new DBExpenseRepository(args.db);
  return {
    userRepository,
    expenseRepository,
  } as const;
}
