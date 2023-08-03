import { BaseEntity } from '../../shared/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from '../../role/entities/role.entity';

@Entity('permission_roles')
export class PermissionRole extends BaseEntity {
  @Column('uuid', { name: 'permission_id' })
  permissionId: string;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @Column('uuid', { name: 'role_id' })
  roleId: string;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
