import { PoolConfig, Pool, PoolClient } from 'pg';

export class Database {
  private pool: Pool;

  constructor(databaseConfig: PoolConfig) {
    this.pool = new Pool(databaseConfig);
  }

  query = (query: string, args?: any[]) => this.pool.query(query, args);

  runTransaction = async (callback: (_: PoolClient) => Promise<any>) => {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };

  close = () => this.pool.end();
}
