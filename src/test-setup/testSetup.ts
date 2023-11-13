/* eslint-disable import/first */
// @ts-ignore
process.env.TEST = true;

import 'tsconfig-paths/register';
import { Database } from 'base/postgres';
import { runMigrations } from './pg';
import { databaseConfig } from 'config/database';

const setup = async () => {
  // eslint-disable-next-line no-console
  console.log('database setup');
  let pool = new Database({
    connectionString: process.env.ROOT_DATABASE_URL,
  });
  await pool.query('DROP DATABASE IF EXISTS moneysplittest');
  await pool.query('CREATE DATABASE moneysplittest');
  await pool.close();
  pool = new Database(databaseConfig);
  await runMigrations('up');
  await pool.close();
};

export default setup;
