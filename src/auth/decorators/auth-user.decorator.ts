import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { handleError } from '../../shared/utils/error.util';
import { GqlExecutionContext } from '@nestjs/graphql';
import { isEmpty } from 'class-validator';

export const AuthUser = createParamDecorator(
  (property: string | undefined, context: ExecutionContext) => {
    try {
      const request =
        context.getType<string>() === 'graphql'
          ? GqlExecutionContext.create(context).getContext().req
          : context.switchToHttp().getRequest();
      if (isEmpty(request.user)) throw new UnauthorizedException();
      if (property) return request?.user[property];
      return request.user;
    } catch (error) {
      handleError(error);
    }
  },
);
