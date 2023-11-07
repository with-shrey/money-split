import { PoolConfig, Pool } from 'pg';

export async function createPGConnection(databaseConfig: PoolConfig) {
  const pool = new Pool(databaseConfig);
  return pool;
}
