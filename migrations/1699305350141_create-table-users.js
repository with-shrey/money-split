/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      phone VARCHAR(10) UNIQUE NOT NULL,
      group_id INT NOT NULL
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE users;');
};
