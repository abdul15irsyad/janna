import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export default registerAs('database', () => ({
  HOST: process.env.DB_HOST ?? 'localhost',
  PORT: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
  USERNAME: process.env.DB_USERNAME ?? 'postgres',
  PASSWORD: process.env.DB_PASSWORD ?? 'dbpassword',
  NAME: process.env.DB_NAME ?? 'nestjsgraphql',
  POOL_SIZE: process.env.DB_POOL_SIZE ? +process.env.DB_POOL_SIZE : 10,
}));
