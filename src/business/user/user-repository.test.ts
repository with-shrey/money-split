import { createPGConnection } from 'base/postgres';
import { DBUserRepository, UserRepository } from './user-repository';
import { databaseConfig } from 'config/database';

describe('DBUserRepository', () => {
  let pool: any;
  let repository: UserRepository;
  beforeAll(async () => {
    pool = await createPGConnection(databaseConfig);
    repository = new DBUserRepository(pool);
  });

  afterEach(async () => {
    await pool.query('TRUNCATE TABLE users;');
  });

  afterAll(async () => {
    await pool.end();
  });

  test('createUsers - should create users and other others successfully', async () => {
    const users = await repository.createUsers(
      {
        name: 'Test 1',
        phone: '1234567890',
      },
      [
        {
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
        name: 'Test 1',
        phone: '1234567890',
      },
      [],
    );
    const result = await repository.doesUserExist('1234567891');
    expect(result).toBeFalsy();
  });

  test('getUserIdAndGroupId', async () => {
    const [user] = await repository.createUsers(
      {
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
});
