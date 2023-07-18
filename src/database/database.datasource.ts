import { join } from 'path';
import { DataSource } from 'typeorm';
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_POOL_SIZE,
  DB_PORT,
  DB_USERNAME,
} from './database.config';

const datasource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  poolSize: DB_POOL_SIZE,
  entities: [join(__dirname, '..', '**', 'entities', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: false,
});

export default datasource;
