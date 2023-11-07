import { PoolConfig } from 'pg';
import { env } from './env';

export const databaseConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  max: 20, // set pool max size to 20,
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  // return an error after 2 seconds if connection could not be established
  connectionTimeoutMillis: 2000,
};
