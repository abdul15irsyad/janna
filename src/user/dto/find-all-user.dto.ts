import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { FindAllDto } from '../../shared/dto/find-all.dto';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsExists } from '../../shared/validators/is-exists.validator';
import { Role } from '../../role/entities/role.entity';

export class FindAllUserDto extends FindAllDto {
  @IsIn(['name', 'email', 'createdAt'], {
    message: i18nValidationMessage('validation.IS_IN'),
  })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsOptional()
  orderBy?: 'name' | 'email' | 'createdAt';

  @IsExists(
    { entity: Role },
    { message: i18nValidationMessage('validation.IS_EXISTS') },
  )
  @IsUUID(4, { message: i18nValidationMessage('validation.IS_UUID') })
  @IsOptional()
  roleId?: string;
}
