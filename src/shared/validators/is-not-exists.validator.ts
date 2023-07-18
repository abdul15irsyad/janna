import { Type } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isNotEmpty,
} from 'class-validator';
import datasource from '../../database/database.datasource';
import { Not } from 'typeorm';
import { handleError } from '../utils/error.util';

export function IsNotExists(
  isNotExistsOptions: { entity: Type; field?: string; isExcludeId?: boolean },
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    const { entity, field = 'id', isExcludeId } = isNotExistsOptions;
    registerDecorator({
      name: 'IsNotExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(
          value: any,
          args: ValidationArguments,
        ): Promise<boolean> {
          try {
            const where = { [field]: value };
            const id = (args.object as { id: string })?.id;
            if (isExcludeId && field !== 'id' && isNotEmpty(id))
              where['id'] = Not(id);
            const data = await datasource
              .getRepository(entity)
              .findOneBy(where);
            return data === null;
          } catch (error) {
            handleError(error);
          }
        },
      },
    });
  };
}
