import { Database } from 'base/postgres';
import { DBUserRepository, UserRepository } from './user-repository';
import { databaseConfig } from 'config/database';

describe('DBUserRepository', () => {
  let db: Database;
  let repository: UserRepository;

  beforeAll(async () => {
    db = new Database(databaseConfig);
    repository = new DBUserRepository(db);
  });

  afterEach(async () => {
    await db.query('TRUNCATE TABLE users CASCADE;');
  });

  afterAll(async () => {
    await db.close();
  });

  test('createUsers - should create users and other others successfully', async () => {
    const users = await repository.createUsers(
      {
        id: 0,
        name: 'Test 1',
        phone: '1234567890',
      },
      [
        {
          id: 0,
          name: 'Test 2',
          phone: '1234567891',
        },
      ],
    );
    expect(users.length).toEqual(2);
    expect(users[0]).toEqual(
      expect.objectContaining({
        name: 'Test 1',
        phone: '1234567890',
        groupId: users[0].id,
      }),
    );
    expect(users[1]).toEqual(
      expect.objectContaining({
        name: 'Test 2',
        phone: '1234567891',
        groupId: users[0].id,
      }),
    );
  });

  test('doesUserExist - should return true if user exists', async () => {
    await repository.createUsers(
      {
        id: 0,
        name: 'Test 1',
        phone: '1234567890',
      },
      [],
    );
    const result = await repository.doesUserExist('1234567890');
    expect(result).toBeTruthy();
  });

  test('doesUserExist - should return false if user doesnt exists', async () => {
    await repository.createUsers(
      {
        id: 0,
        name: 'Test 1',
        phone: '1234567890',
      },
      [],
    );
    const result = await repository.doesUserExist('1234567891');
    expect(result).toBeFalsy();
  });

  test('getUserIdAndGroupIdByPhone', async () => {
    const [user] = await repository.createUsers(
      {
        id: 0,
        name: 'Test 1',
        phone: '1234567890',
      },
      [],
    );
    const result = await repository.getUserIdAndGroupIdByPhone('1234567890');
    expect(result).toEqual({
      id: user.id,
      groupId: user.groupId,
    });
  });

  test('getUserById', async () => {
    const [user] = await repository.createUsers(
      {
        id: 0,
        name: 'Test 1',
        phone: '1234567890',
      },
      [],
    );
    const result = await repository.getUserIdAndGroupIdByPhone(user.phone);
    expect(result).toEqual({
      id: user.id,
      groupId: user.groupId,
    });
  });

  test('getUsersByGroupId', async () => {
    await repository.createUsers(
      {
        id: 0,
        name: 'Test 1',
        phone: '1234567890',
      },
      [
        {
          id: 0,
          name: 'Test 2',
          phone: '1234567892',
        },
        {
          id: 0,
          name: 'Test 3',
          phone: '1234567893',
        },
      ],
    );
    const userGroup2 = await repository.createUsers(
      {
        id: 0,
        name: 'Test 4',
        phone: '5234567890',
      },
      [
        {
          id: 0,
          name: 'Test 5',
          phone: '5234567892',
        },
        {
          id: 0,
          name: 'Test 6',
          phone: '5234567893',
        },
      ],
    );
    const result = await repository.getUsersByGroupId(userGroup2[0].groupId ?? -1);
    expect(result).toEqual([
      expect.objectContaining({
        name: 'Test 4',
        phone: '5234567890',
        groupId: userGroup2[0].groupId,
      }),
      expect.objectContaining({
        name: 'Test 5',
        phone: '5234567892',
        groupId: userGroup2[0].groupId,
      }),
      expect.objectContaining({
        name: 'Test 6',
        phone: '5234567893',
        groupId: userGroup2[0].groupId,
      }),
    ]);
  });
});
