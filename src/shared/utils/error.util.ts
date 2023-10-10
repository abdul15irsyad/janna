import {
  HttpException,
  InternalServerErrorException,
  PayloadTooLargeException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError } from 'jsonwebtoken';

export const handleError = (error: any) => {
  if (error?.status >= 500) console.error(error);
  if (error instanceof JsonWebTokenError) throw new UnauthorizedException();
  if (error instanceof HttpException) throw error;
  if (error.status === 413) throw new PayloadTooLargeException(error.message);
  throw new InternalServerErrorException(error.message ?? error);
};
