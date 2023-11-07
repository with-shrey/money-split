import supertest from 'supertest';
import { createApp } from '.';
import { createPGConnection } from './base/postgres';
import { databaseConfig } from './config/database';

describe('API server', () => {
  it('should be able to start and respond with OK and 200 status code', async () => {
    const dbPool = await createPGConnection(databaseConfig);
    const app = createApp(dbPool);

    const response = await supertest(app).get('/healthcheck');
    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });
});
