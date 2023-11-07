/* eslint-disable camelcase */

exports.up = (pgm) => {
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
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE expenses;');
};
