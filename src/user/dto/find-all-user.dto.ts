import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { FindAllDto } from '../../shared/dto/find-all.dto';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsExists } from '../../shared/validators/is-exists.validator';
import { Role } from '../../role/entities/role.entity';

export class FindAllUserDto extends FindAllDto {
  @IsIn(['name', 'email', 'createdAt'], {
    message: i18nValidationMessage('validation.IS_IN', {
      property: 'ORDER_BY',
    }),
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'ORDER_BY',
    }),
  })
  @IsOptional()
  orderBy?: 'name' | 'email' | 'createdAt';

  @IsExists(
    { entity: Role },
    {
      message: i18nValidationMessage('validation.IS_EXISTS', {
        property: 'ROLE_ID',
      }),
    },
  )
  @IsUUID(4, {
    message: i18nValidationMessage('validation.IS_UUID', {
      property: 'ROLE_ID',
    }),
  })
  @IsOptional()
  roleId?: string;
}
