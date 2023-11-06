import supertest from 'supertest';
import { createApp } from '.';

const app = createApp();

describe('API server', () => {
  it('should be able to start and respond with OK and 200 status code', async () => {
    const response = await supertest(app).get('/healthcheck');
    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });
});
