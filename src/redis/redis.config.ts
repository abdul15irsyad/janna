import * as dotenv from 'dotenv';
import Redis, { RedisOptions } from 'ioredis';
dotenv.config({ path: '.env' });

export const REDIS_HOST = process.env.REDIS_HOST ?? 'localhost';
export const REDIS_PORT = process.env.REDIS_PORT
  ? +process.env.REDIS_PORT
  : 6379;
export const REDIS_DATABASE_INDEX = process.env.REDIS_DATABASE_INDEX
  ? +process.env.REDIS_DATABASE_INDEX
  : 1;
export const REDIS_TTL = process.env.REDIS_TTL ? +process.env.REDIS_TTL : 1800;
export const REDIS_RECONNECT_INTERVAL = process.env.REDIS_RECONNECT_INTERVAL
  ? +process.env.REDIS_RECONNECT_INTERVAL
  : 1 * 60;
export const REDIS_OPTIONS: RedisOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  db: REDIS_DATABASE_INDEX,
  retryStrategy: () => null,
  connectionName: 'janna',
  lazyConnect: true,
};
export const redis = new Redis(REDIS_OPTIONS);
