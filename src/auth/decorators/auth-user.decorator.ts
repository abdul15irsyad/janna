import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { handleError } from '../../shared/utils/error.util';
import { GqlExecutionContext } from '@nestjs/graphql';

export const AuthUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    try {
      const request =
        (ctx.getType() as string) === 'graphql'
          ? GqlExecutionContext.create(ctx).getContext().req
          : ctx.switchToHttp().getRequest();
      if (!request.user) throw new NotFoundException('akun tidak ditemukan');
      if (data) return request?.user[data];
      return request.user;
    } catch (error) {
      handleError(error);
    }
  },
);
