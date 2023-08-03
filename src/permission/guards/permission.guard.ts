import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { GqlExecutionContext } from '@nestjs/graphql';
import { useCache } from '../../shared/utils/cache.util';
import datasource from '../../database/database.datasource';
import { Role } from '../../role/entities/role.entity';
import { isNotEmpty } from 'class-validator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private permissionActionModule: { actionSlug: string; moduleSlug: string },
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req =
      context.getType<string>() === 'graphql'
        ? GqlExecutionContext.create(context).getContext().req
        : context.switchToHttp().getRequest();
    const user: User = req.user;
    if (!user) return false;
    // use cache data role if exists
    const role = await useCache(`roleWithPermissions:${user.roleId}`, () =>
      datasource.getRepository(Role).findOne({
        where: { id: user.roleId },
        relations: { permissions: { module: true, action: true } },
      }),
    );

    // check permissions
    return isNotEmpty(
      role.permissions.find(
        (permission) =>
          permission.action.slug === this.permissionActionModule.actionSlug &&
          permission.module.slug === this.permissionActionModule.moduleSlug,
      ),
    );
  }
}
