import { HttpException, InternalServerErrorException } from '@nestjs/common';

export const handleError = (error: any) => {
  if (error?.status >= 500) console.error(error);
  if (error instanceof HttpException) throw error;
  throw new InternalServerErrorException(error.message ?? error);
};
