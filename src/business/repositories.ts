import { Pool } from 'pg';
import { DBUserRepository } from './user/user-repository';

type DependencyArgs = {
  db: Pool;
};

export function createRepositories(args: DependencyArgs) {
  const userRepository = new DBUserRepository(args.db);
  return {
    userRepository,
  } as const;
}
