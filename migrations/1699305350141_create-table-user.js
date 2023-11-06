/* eslint-disable camelcase */

exports.up = (pgm) => {
  // Create a new table
  pgm.sql(`
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10, 2) NOT NULL
    );
  `);
};

exports.down = (pgm) => {
  // Drop the 'products' table
  pgm.sql('DROP TABLE products;');
};
