import { config } from 'dotenv';
config({ path: '.env' });

type NodeEnvironment = 'development' | 'staging' | 'production';
export const NODE_ENV =
  (process.env.NODE_ENV as NodeEnvironment) ?? 'development';
export const APP_NAME = process.env.APP_NAME || 'Janna';
export const PORT = process.env.PORT ? +process.env.PORT : 3000;
export const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
export const ORIGINS = process.env.ORIGINS
  ? process.env.ORIGINS.split(',')
  : '*';

export const THROTTLE_TTL = process.env.THROTTLE_TTL
  ? +process.env.THROTTLE_TTL
  : 60;
export const THROTTLE_LIMIT = process.env.THROTTLE_LIMIT
  ? +process.env.THROTTLE_LIMIT
  : 10;
