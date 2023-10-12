import { registerAs } from '@nestjs/config';

export type NodeEnvironment = 'development' | 'staging' | 'production';

export default registerAs('app', function () {
  const PORT = process.env.PORT ? +process.env.PORT : 3000;
  return {
    NODE_ENV: (process.env.NODE_ENV as NodeEnvironment) ?? 'development',
    APP_NAME: process.env.APP_NAME || 'Janna',
    PORT,
    BASE_URL: process.env.BASE_URL || `http://localhost:${PORT}`,
    ORIGINS: process.env.ORIGINS ? process.env.ORIGINS.split(',') : '*',

    THROTTLE_TTL: process.env.THROTTLE_TTL ? +process.env.THROTTLE_TTL : 60,
    THROTTLE_LIMIT: process.env.THROTTLE_LIMIT
      ? +process.env.THROTTLE_LIMIT
      : 10,
  };
});
