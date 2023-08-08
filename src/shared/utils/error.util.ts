import {
  HttpException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError } from 'jsonwebtoken';

export const handleError = (error: any) => {
  console.log('handleError');
  if (error?.status >= 500) console.error(error);
  if (error instanceof JsonWebTokenError) throw new UnauthorizedException();
  if (error instanceof HttpException) throw error;
  throw new InternalServerErrorException(error.message ?? error);
};
