import { createPGConnection } from 'base/postgres';
import { DBExpenseRepository, ExpenseRepository } from './expense-repository';
import { DBUserRepository, UserDTO } from 'business/user/user-repository';
import { databaseConfig } from 'config/database';
import { Pool } from 'pg';

describe('DBExpenseRepository', () => {
  let pool: Pool;
  let repository: ExpenseRepository;
  let users: UserDTO[];

  beforeAll(async () => {
    pool = await createPGConnection(databaseConfig);
    repository = new DBExpenseRepository(pool);
    const userRepository = new DBUserRepository(pool);
    users = await userRepository.createUsers(
      {
        name: 'Expense User 1',
        phone: '0000000000',
      },
      [
        {
          name: 'Expense User  2',
          phone: '0000000002',
        },
        {
          name: 'Expense User  3',
          phone: '0000000003',
        },
        {
          name: 'Expense User  4',
          phone: '0000000004',
        },
      ],
    );
  });

  afterEach(async () => {
    await pool.query('TRUNCATE TABLE expense_parts CASCADE;');
    await pool.query('TRUNCATE TABLE expenses CASCADE;');
  });

  afterAll(async () => {
    await pool.query('TRUNCATE TABLE users CASCADE;');
    await pool.end();
  });

  test('insertExpense - should save expense and parts', async () => {
    const partsInput = [
      {
        splitAmount: 250,
        owedBy: users[1].id ?? -1,
        owedTo: users[0].id ?? -1,
      },
      {
        splitAmount: 250,
        owedBy: users[2].id ?? -1,
        owedTo: users[0].id ?? -1,
      },
      {
        splitAmount: 250,
        owedBy: users[3].id ?? -1,
        owedTo: users[0].id ?? -1,
      },
    ];
    const { expense } = await repository.insertExpense(
      {
        name: 'Expense 1',
        amount: 1000,
        splitType: 'equal',
        groupId: users[0]?.groupId ?? -1,
      },
      partsInput,
    );
    const result = await pool.query('SELECT * FROM expenses');
    const partsResult = await pool.query('SELECT * FROM expense_parts');
    expect(result.rowCount).toEqual(1);
    expect(partsResult.rowCount).toEqual(3);
    expect(result.rows).toEqual([
      expect.objectContaining({
        name: 'Expense 1',
        amount: '1000.00',
        split_type: 'equal',
        group_id: users[0]?.groupId,
      }),
    ]);
    expect(partsResult.rows).toEqual(
      partsInput.map((part) =>
        expect.objectContaining({
          owed_by: part.owedBy,
          owed_to: part.owedTo,
          split_amount: part.splitAmount.toFixed(2),
          expense_id: expense.id,
        }),
      ),
    );
  });

  test('getExpensesBetweenTwoUsers - should give all expenses that are between two users', async () => {
    await repository.insertExpense(
      {
        name: 'Expense 1',
        amount: 300,
        splitType: 'equal',
        groupId: users[0]?.groupId ?? -1,
      },
      [
        {
          splitAmount: 100,
          owedBy: users[1].id ?? -1,
          owedTo: users[0].id ?? -1,
        },
        {
          splitAmount: 100,
          owedBy: users[2].id ?? -1,
          owedTo: users[0].id ?? -1,
        },
      ],
    );
    await repository.insertExpense(
      {
        name: 'Expense 2',
        amount: 1000,
        splitType: 'equal',
        groupId: users[0]?.groupId ?? -1,
      },
      [
        {
          splitAmount: 250,
          owedBy: users[1].id ?? -1,
          owedTo: users[0].id ?? -1,
        },
        {
          splitAmount: 250,
          owedBy: users[2].id ?? -1,
          owedTo: users[0].id ?? -1,
        },
        {
          splitAmount: 250,
          owedBy: users[3].id ?? -1,
          owedTo: users[0].id ?? -1,
        },
      ],
    );
    const { expenses, parts } = await repository.getExpensesBetweenTwoUsers(
      users[0].id ?? -1,
      users[3].id ?? -1,
    );

    expect(expenses.length).toEqual(1);
    expect(parts.length).toEqual(1);
    expect(expenses).toEqual([
      expect.objectContaining({
        name: 'Expense 2',
        amount: 1000,
        splitType: 'equal',
        groupId: users[0]?.groupId ?? -1,
      }),
    ]);
    expect(parts).toEqual([
      expect.objectContaining({
        splitAmount: 250,
        owedBy: users[3].id ?? -1,
        owedTo: users[0].id ?? -1,
      }),
    ]);
  });

  test('getBalancesForUserID - should give sum of all balances for a user', async () => {
    await repository.insertExpense(
      {
        name: 'Expense 1',
        amount: 300,
        splitType: 'equal',
        groupId: users[0]?.groupId ?? -1,
      },
      [
        {
          splitAmount: 100,
          owedBy: users[1].id ?? -1,
          owedTo: users[0].id ?? -1,
        },
        {
          splitAmount: 100,
          owedBy: users[2].id ?? -1,
          owedTo: users[0].id ?? -1,
        },
      ],
    );
    await repository.insertExpense(
      {
        name: 'Expense 2',
        amount: 1000,
        splitType: 'equal',
        groupId: users[0]?.groupId ?? -1,
      },
      [
        {
          splitAmount: 250,
          owedBy: users[1].id ?? -1,
          owedTo: users[0].id ?? -1,
        },
        {
          splitAmount: 250,
          owedBy: users[2].id ?? -1,
          owedTo: users[0].id ?? -1,
        },
        {
          splitAmount: 250,
          owedBy: users[3].id ?? -1,
          owedTo: users[0].id ?? -1,
        },
      ],
    );

    await repository.insertExpense(
      {
        name: 'Expense 3',
        amount: 1000,
        splitType: 'equal',
        groupId: users[0]?.groupId ?? -1,
      },
      [
        {
          splitAmount: 1000,
          owedBy: users[0].id ?? -1,
          owedTo: users[3].id ?? -1,
        },
      ],
    );
    const balances = await repository.getBalancesForUserID(users[0].id ?? -1);

    expect(balances.length).toEqual(3);
    expect(balances).toEqual([
      {
        userId: users[3].id ?? -1,
        amountOwedByUser: 1000,
        amountOwedToUser: 250,
        balance: -750,
      },
      {
        userId: users[1].id ?? -1,
        amountOwedByUser: 0,
        amountOwedToUser: 350,
        balance: 350,
      },
      {
        userId: users[2].id ?? -1,
        amountOwedByUser: 0,
        amountOwedToUser: 350,
        balance: 350,
      },
    ]);
  });
});
