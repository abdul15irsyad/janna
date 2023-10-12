import { join } from 'path';
import { DataSource } from 'typeorm';
import databaseConfig from './database.config';

const datasource = new DataSource({
  type: 'postgres',
  host: databaseConfig().HOST,
  port: databaseConfig().PORT,
  username: databaseConfig().USERNAME,
  password: databaseConfig().PASSWORD,
  database: databaseConfig().NAME,
  poolSize: databaseConfig().POOL_SIZE,
  entities: [join(__dirname, '..', '**', 'entities', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: false,
});

export default datasource;
