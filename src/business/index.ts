import { Pool } from 'pg';
import { createRepositories } from './repositories';
import { UserService } from './user/user-service';
import { ExpenseService } from './expense/expense-service';

export type DependencyArgs = {
  db: Pool;
};

export function createDependencyContainer(args: DependencyArgs) {
  const { userRepository, expenseRepository } = createRepositories(args);

  const userService = new UserService(userRepository);
  const expenseService = new ExpenseService(expenseRepository, userService);

  return {
    userService,
    expenseService,
  } as const;
}

export type DependencyContainer = ReturnType<typeof createDependencyContainer>;
