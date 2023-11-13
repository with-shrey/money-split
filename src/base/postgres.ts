import { PoolConfig, Pool, PoolClient } from 'pg';
import format from 'pg-format';

class TransactionClient {
  constructor(public client: PoolClient) {
    this.client = client;
  }

  query = (query: string, args?: any[]) => this.client.query(query, args);

  queryWithList = (query: string, values: any[][]) => {
    const formattedQuery = format(query, values);
    return this.client.query(formattedQuery);
  };
}

export class Database {
  private pool: Pool;

  constructor(databaseConfig: PoolConfig) {
    this.pool = new Pool(databaseConfig);
  }

  query = (query: string, args?: any[]) => this.pool.query(query, args);

  runTransaction = async (callback: (_: TransactionClient) => Promise<any>) => {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(new TransactionClient(client));
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };

  queryWithList = (query: string, values: any[][]) => {
    const formattedQuery = format(query, values);
    return this.pool.query(formattedQuery);
  };

  close = () => this.pool.end();
}
