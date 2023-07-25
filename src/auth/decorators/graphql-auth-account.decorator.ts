import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { handleError } from '../../shared/utils/error.util';

export const GraphQLAuthAccount = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    try {
      const request = GqlExecutionContext.create(ctx).getContext().req;
      if (!request.user) throw new NotFoundException('akun tidak ditemukan');
      if (data) return request?.user[data];
      return request.user;
    } catch (error) {
      handleError(error);
    }
  },
);
