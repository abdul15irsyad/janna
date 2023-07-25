import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { handleError } from '../../shared/utils/error.util';

export const AuthAccount = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    try {
      const request = ctx.switchToHttp().getRequest();
      if (!request.user) throw new NotFoundException('akun tidak ditemukan');
      if (data) return request?.user[data];
      return request.user;
    } catch (error) {
      handleError(error);
    }
  },
);
