/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE expense_parts (
      id SERIAL PRIMARY KEY,
      expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE RESTRICT,
      owed_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      owed_to INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      split_amount NUMERIC(10, 2) NOT NULL
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE expense_parts;');
};
