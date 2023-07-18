import { IsIn, IsOptional, IsString } from 'class-validator';
import { FindAllDto } from '../../shared/dto/find-all.dto';
import { i18nValidationMessage } from 'nestjs-i18n';

export class FindAllRoleDto extends FindAllDto {
  @IsIn(['name', 'createdAt'], {
    message: i18nValidationMessage('validation.IS_IN'),
  })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsOptional()
  orderBy?: 'name' | 'createdAt';
}
