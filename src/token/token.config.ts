import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export const TOKEN_EXPIRED_IN_MINUTES = process.env.TOKEN_EXPIRED_IN_MINUTES
  ? +process.env.TOKEN_EXPIRED_IN_MINUTES
  : 120;
