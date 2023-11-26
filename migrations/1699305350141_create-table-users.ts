/* eslint-disable camelcase */
import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      phone VARCHAR(10) UNIQUE NOT NULL,
      group_id INT NOT NULL
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql('DROP TABLE users;');
}
