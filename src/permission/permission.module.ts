import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Action } from './entities/action.entity';
import { Module as ModuleEntity } from './entities/module.entity';
import { PermissionResolver } from './permission.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Action, ModuleEntity])],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionResolver],
  exports: [PermissionService],
})
export class PermissionModule {}
