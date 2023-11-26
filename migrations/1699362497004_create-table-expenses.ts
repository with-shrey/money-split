/* eslint-disable camelcase */
import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE expenses (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      amount NUMERIC(10, 2) NOT NULL,
      split_type VARCHAR(10) NOT NULL,
      group_id INTEGER NOT NULL

      CONSTRAINT check_split_type CHECK (split_type IN ('equal', 'percentage'))
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('DROP TABLE expenses;');
}
