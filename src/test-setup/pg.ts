import runner from 'node-pg-migrate';
import path from 'path';

export async function runMigrations(type: 'up' | 'down') {
  await runner({
    databaseUrl: process.env.DATABASE_URL ?? '',
    direction: type,
    migrationsTable: 'pgmigrations',
    dir: path.resolve(__dirname, '..', '..', 'migrations'),
  });
}
