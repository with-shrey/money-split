/* eslint-disable camelcase */

const format = require('pg-format');

exports.shorthands = undefined;

// since the data set is small this is fine but for large tables
// we would probably need to do this in a batch job within smaller transactions
exports.up = async (pgm) => {
  const users = await pgm.db.select(`
    SELECT id, name, group_id from users
    ORDER BY group_id ASC, id ASC;
  `);

  const data = {};
  users.forEach((user) => {
    if (!data[user.group_id]) {
      data[user.group_id] = {
        created_by: user.id,
        name: `${user.name}'s Default Group`,
        user_ids: [],
      };
    }
    data[user.group_id].user_ids.push(user.id);
  });

  const userGroups = Object.values(data);

  const createGroups = format(
    `
  INSERT INTO groups (name, created_by)
      VALUES %L
      ON CONFLICT
        DO NOTHING
      RETURNING id;
  `,
    userGroups.map((value) => [value.name, value.created_by]),
  );
  const groupIds = await pgm.db.select(createGroups);

  const userGroupIds = [];
  groupIds.forEach(({ id: groupId }, index) => {
    userGroups[index].user_ids.forEach((userId) => {
      userGroupIds.push([groupId, userId]);
    });
  });

  await pgm.sql(
    format(
      `
      INSERT INTO user_groups (group_id, user_id)
      VALUES %L
      ON CONFLICT
        DO NOTHING;
    `,
      userGroupIds,
    ),
  );
};

exports.down = (pgm) => {};
