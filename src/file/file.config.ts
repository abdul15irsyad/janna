import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export const UPLOAD_PATH = process.env.UPLOAD_PATH ?? 'uploads';
export const MAX_UPLOAD_FILE_SIZE = process.env.MAX_UPLOAD_FILE_SIZE
  ? +process.env.MAX_UPLOAD_FILE_SIZE
  : 1024 * 1024 * 20;
export const MAX_UPLOAD_IMAGE_SIZE = process.env.MAX_UPLOAD_IMAGE_SIZE
  ? +process.env.MAX_UPLOAD_IMAGE_SIZE
  : 1024 * 1024 * 10;

export const IMAGE_MIMES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/webp',
];
