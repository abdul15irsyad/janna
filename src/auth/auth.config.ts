import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  JWT_SECRET: process.env.JWT_SECRET ?? 'JannaBoilerplate',
  ACCESS_TOKEN_EXPIRED: process.env.ACCESS_TOKEN_EXPIRED
    ? +process.env.ACCESS_TOKEN_EXPIRED
    : 60 * 60 * 2,
  REFRESH_TOKEN_EXPIRED: process.env.REFRESH_TOKEN_EXPIRED
    ? +process.env.REFRESH_TOKEN_EXPIRED
    : 60 * 60 * 24 * 3,

  CLIENT_BASE_URL: process.env.CLIENT_BASE_URL ?? 'https://example.com',
  CLIENT_RESET_PASSWORD_URL:
    process.env.CLIENT_RESET_PASSWORD_URL ?? 'auth/reset-password',
  CLIENT_EMAIL_VERIFICATION_URL:
    process.env.CLIENT_EMAIL_VERIFICATION_URL ?? 'auth/email-verification',
}));
