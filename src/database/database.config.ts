import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export const DB_HOST = process.env.DB_HOST ?? 'localhost';
export const DB_PORT = process.env.DB_PORT ? +process.env.DB_PORT : 5432;
export const DB_USERNAME = process.env.DB_USERNAME ?? 'postgres';
export const DB_PASSWORD = process.env.DB_PASSWORD ?? 'dbpassword';
export const DB_NAME = process.env.DB_NAME ?? 'nestjsgraphql';
export const DB_POOL_SIZE = process.env.DB_POOL_SIZE
  ? +process.env.DB_POOL_SIZE
  : 10;
