import { Pool } from 'pg';
import { createRepositories } from './repositories';
import { UserService } from './user/user-service';

export type DependencyArgs = {
  db: Pool;
};

export function createDependencyContainer(args: DependencyArgs) {
  const { userRepository } = createRepositories(args);

  const userService = new UserService(userRepository);

  return {
    userService,
  } as const;
}

export type DependencyContainer = ReturnType<typeof createDependencyContainer>;
