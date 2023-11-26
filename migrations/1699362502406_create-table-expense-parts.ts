/* eslint-disable camelcase */
import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE expense_parts (
      id SERIAL PRIMARY KEY,
      expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
      owed_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      owed_to INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      split_amount NUMERIC(10, 2) NOT NULL
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('DROP TABLE expense_parts;');
}
