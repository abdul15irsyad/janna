import { config } from 'dotenv';

config({ path: '.env' });
export const SMTP_HOST = process.env.SMTP_HOST || 'smtp.mailtrap.io';
export const SMTP_PORT = process.env.SMTP_PORT ? +process.env.SMTP_PORT : 2525;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const SMTP_FROM = process.env.SMTP_FROM;
