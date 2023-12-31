import { Database } from 'base/postgres';

export type UserDTO = {
  id: number;
  phone: string;
  name: string;
  groupId?: number;
};

/* eslint-disable no-unused-vars */
export interface UserRepository {
  createUsers: (newUser: UserDTO, users: UserDTO[]) => Promise<UserDTO[]>;
  doesUserExist: (_: string) => Promise<boolean>;
  getUserIdAndGroupIdByPhone: (_: string) => Promise<UserDTO | null>;
  getUserById: (_: string) => Promise<UserDTO | null>;
  getUsersByGroupId(groupId: number): Promise<UserDTO[]>;
}

export class DBUserRepository implements UserRepository {
  constructor(public db: Database) {
    this.db = db;
  }

  createUsers = async (newUser: UserDTO, otherUsers: UserDTO[]): Promise<UserDTO[]> => {
    const result = await this.db.runTransaction(async (client) => {
      const createNewUserQuery = `
          INSERT INTO users (phone, name, group_id)
          VALUES ($1, $2, (SELECT last_value FROM users_id_seq))
          RETURNING id, phone, name, group_id
        `;
      const userCreateResult = await client.query(createNewUserQuery, [
        newUser.phone,
        newUser.name,
      ]);
      const newUserId = userCreateResult.rows[0].id;
      const insertOtherUsers = `
          INSERT INTO users (phone, name, group_id)
          VALUES  %L
          -- to avoid failing signup on duplicate generated users
          ON CONFLICT (phone) 
          DO 
            NOTHING
          `;
      const values = otherUsers.map((user) => [user.phone, user.name, newUserId]);
      if (values.length > 0) {
        await client.queryWithList(insertOtherUsers, values);
      }
      const allUsersInGroup = await client.query(
        'SELECT id, phone, name, group_id FROM users WHERE group_id = $1',
        [newUserId],
      );
      return allUsersInGroup;
    });

    return this.toUserDTOArray(result);
  };

  doesUserExist = async (phone: string): Promise<boolean> => {
    const result = await this.db.query('SELECT EXISTS (SELECT 1 FROM users WHERE phone = $1)', [
      phone,
    ]);
    return result.rows[0].exists;
  };

  getUserIdAndGroupIdByPhone = async (phone: string): Promise<UserDTO | null> => {
    const result = await this.db.query('SELECT id, group_id FROM users WHERE phone = $1', [phone]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.toUserDTO(result.rows[0]);
  };

  getUserById = async (id: string): Promise<UserDTO | null> => {
    const result = await this.db.query(
      'SELECT id, name, group_id, phone FROM users WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      return null;
    }
    return this.toUserDTO(result.rows[0]);
  };

  getUsersByGroupId = async (groupId: number): Promise<UserDTO[]> => {
    const result = await this.db.query(
      'SELECT id, name, group_id, phone FROM users WHERE group_id = $1',
      [groupId],
    );
    return this.toUserDTOArray(result);
  };

  toUserDTO = (row: any): UserDTO => ({
    id: row.id,
    phone: row.phone,
    name: row.name,
    groupId: row.group_id,
  });

  toUserDTOArray = (result: any): UserDTO[] => result.rows.map((row: any) => this.toUserDTO(row));
}
