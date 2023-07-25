import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export const JWT_SECRET = process.env.JWT_SECRET ?? 'JannaBoilerplate';
export const ACCESS_TOKEN_EXPIRED = process.env.ACCESS_TOKEN_EXPIRED
  ? +process.env.ACCESS_TOKEN_EXPIRED
  : 60 * 60 * 2;
export const REFRESH_TOKEN_EXPIRED = process.env.REFRESH_TOKEN_EXPIRED
  ? +process.env.REFRESH_TOKEN_EXPIRED
  : 60 * 60 * 24 * 3;

export const CLIENT_BASE_URL =
  process.env.CLIENT_BASE_URL ?? 'https://example.com';
export const CLIENT_RESET_PASSWORD_URL =
  process.env.CLIENT_RESET_PASSWORD_URL ?? 'auth/reset-password';
export const CLIENT_EMAIL_VERIFICATION_URL =
  process.env.CLIENT_EMAIL_VERIFICATION_URL ?? 'auth/email-verification';
