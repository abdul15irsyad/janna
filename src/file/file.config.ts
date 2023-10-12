import { registerAs } from '@nestjs/config';

export default registerAs('file', () => ({
  UPLOAD_PATH: process.env.UPLOAD_PATH ?? 'uploads',
  MAX_UPLOAD_FILE_SIZE: process.env.MAX_UPLOAD_FILE_SIZE
    ? +process.env.MAX_UPLOAD_FILE_SIZE
    : 1024 * 1024 * 0.02,
  MAX_UPLOAD_IMAGE_SIZE: process.env.MAX_UPLOAD_IMAGE_SIZE
    ? +process.env.MAX_UPLOAD_IMAGE_SIZE
    : 1024 * 1024 * 0.01,

  IMAGE_MIMES: ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'],
}));
