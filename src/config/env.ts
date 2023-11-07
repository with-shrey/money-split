// @ts-ignore

import dotenv from 'dotenv';
import { z } from 'zod';
import { validate } from 'base/validation';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', process.env.TEST ? '.env.test' : '.env') });

const envSchema = z.object({
  PORT: z.number().or(z.string().regex(/\d+/).transform(Number)).default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),
  DATABASE_URL: z
    .string()
    .url()
    .default('postgres://postgres:postgres@db:5432/moneysplit?sslmode=disable'),
  JWT_SECRET: z.string().min(10).nonempty().default('secretsuperlargejwtsecret'),
});

export const env = validate(envSchema, process.env);
