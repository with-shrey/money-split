import { DBUserRepository } from './user/user-repository';
import { DBExpenseRepository } from './expense/expense-repository';
import { Database } from 'base/postgres';

type DependencyArgs = {
  db: Database;
};

export function createRepositories(args: DependencyArgs) {
  const userRepository = new DBUserRepository(args.db);
  const expenseRepository = new DBExpenseRepository(args.db);
  return {
    userRepository,
    expenseRepository,
  } as const;
}
