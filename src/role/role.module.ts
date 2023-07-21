import { Module, forwardRef } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { UserModule } from '../user/user.module';
import { RoleResolver } from './role.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), forwardRef(() => UserModule)],
  controllers: [RoleController],
  providers: [RoleService, RoleResolver],
  exports: [RoleService],
})
export class RoleModule {}
