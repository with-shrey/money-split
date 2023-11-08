/* eslint-disable no-sparse-arrays */
import supertest from 'supertest';
import { createApp } from '.';
import { createPGConnection } from './base/postgres';
import { databaseConfig } from './config/database';
import { Pool } from 'pg';
import { Application } from 'express';

async function createUser(app: Application, phone: string) {
  const userRes = await supertest(app).post('/api/user/create').send({
    name: 'Test 1',
    phone,
  });
  return userRes.body;
}
async function createAndLogin(app: Application, phone: string) {
  const users: any[] = await createUser(app, phone);
  const response = await supertest(app).post('/api/user/login').send({
    phone,
  });
  const token = `${response.body.prefix} ${response.body.token}`;
  return { token, users, currentUserIndex: users.findIndex((user) => user.phone === phone) };
}

async function createExpenses(app: Application, token: string, users: any[]) {
  await supertest(app)
    .post('/api/expense')
    .set('Authorization', token)
    .send({
      splitType: 'percentage',
      name: 'Expense 1',
      amount: 1000,
      paidBy: users[3].id,
      splits: [
        {
          userId: users[0].id,
          split: 25,
        },
        {
          userId: users[2].id,
          split: 75,
        },
      ],
    });
  await supertest(app)
    .post('/api/expense')
    .set('Authorization', token)
    .send({
      splitType: 'percentage',
      name: 'Expense 2',
      amount: 10000,
      paidBy: users[0].id,
      splits: [
        {
          userId: users[3].id,
          split: 25,
        },
        {
          userId: users[4].id,
          split: 75,
        },
      ],
    });
}

describe('API server: E2E', () => {
  let pool: Pool;
  let app: Application;
  beforeAll(async () => {
    pool = await createPGConnection(databaseConfig);
    app = createApp(pool);
  });

  afterEach(async () => {
    await pool.query('TRUNCATE TABLE expense_parts CASCADE;');
    await pool.query('TRUNCATE TABLE expenses CASCADE;');
    await pool.query('TRUNCATE TABLE users CASCADE;');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('GET /health-check', async () => {
    const response = await supertest(app).get('/health-check');
    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });

  it('POST - /api/user/create', async () => {
    const response = await supertest(app).post('/api/user/create').send({
      name: 'Test 1',
      phone: '1234567890',
    });
    expect(response.status).toBe(201);
    expect(response.body.length).toBe(6);
    expect(response.body[0]).toEqual(
      expect.objectContaining({
        name: 'Test 1',
        phone: '1234567890',
      }),
    );
  });

  it('POST - /api/user/login', async () => {
    await createUser(app, '0000000000');
    const response = await supertest(app).post('/api/user/login').send({
      phone: '0000000000',
    });
    expect(response.status).toBe(200);
    expect(response.body.token.length).toBeGreaterThan(1);
    expect(response.body.prefix).toEqual('Bearer');
  });

  it('POST - /api/expense/create', async () => {
    const { token, users } = await createAndLogin(app, '2345678910');
    const response = await supertest(app)
      .post('/api/expense')
      .set('Authorization', token)
      .send({
        splitType: 'percentage',
        name: 'Expense 1',
        amount: 1000,
        paidBy: users[3].id,
        splits: [
          {
            userId: users[0].id,
            split: 25,
          },
          {
            userId: users[2].id,
            split: 75,
          },
        ],
      });
    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        amount: 1000,
        name: 'Expense 1',
        splitType: 'percentage',
        parts: [
          { splitAmount: 250, owedBy: users[0].id, owedTo: users[3].id },
          { splitAmount: 750, owedBy: users[2].id, owedTo: users[3].id },
        ],
      }),
    );
  });

  it('POST - /api/user/{userId}/expenses', async () => {
    const { token, users, currentUserIndex } = await createAndLogin(app, '2345678910');
    await createExpenses(app, token, users);
    const response = await supertest(app)
      .get(`/api/user/${users[3].id}/expenses`)
      .set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      expect.objectContaining({
        amount: 1000,
        name: 'Expense 1',
        parts: [{ owedBy: users[currentUserIndex].id, owedTo: users[3].id, splitAmount: 250 }],
        splitType: 'percentage',
      }),
      expect.objectContaining({
        amount: 10000,
        name: 'Expense 2',
        parts: [{ owedBy: users[3].id, owedTo: users[currentUserIndex].id, splitAmount: 2500 }],
        splitType: 'percentage',
      }),
    ]);
  });

  it('POST - /api/user/{userId}/balances', async () => {
    const { token, users } = await createAndLogin(app, '2345678910');
    await createExpenses(app, token, users);
    const response = await supertest(app).get('/api/user/me/balances').set('Authorization', token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        amountOwedByUser: 250,
        amountOwedToUser: 2500,
        balance: 2250,
        userId: users[3].id,
      },
      {
        amountOwedByUser: 0,
        amountOwedToUser: 7500,
        balance: 7500,
        userId: users[4].id,
      },
    ]);
  });
});
