import { env } from './env';

export const DatabaseConfig = {
  connectionString: env.DATABASE_URL,
};
