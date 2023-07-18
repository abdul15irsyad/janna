import { Type } from '@nestjs/common';
import { registerDecorator, ValidationOptions } from 'class-validator';
import datasource from '../../database/database.datasource';
import { handleError } from '../utils/error.util';

export function IsExists(
  isExistsOptions: { entity: Type; field?: string },
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    const { entity, field = 'id' } = isExistsOptions;
    registerDecorator({
      name: 'IsExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(value: any): Promise<boolean> {
          try {
            const where = { [field]: value };
            const data = await datasource
              .getRepository(entity)
              .findOneBy(where);
            return data !== null;
          } catch (error) {
            handleError(error);
          }
        },
      },
    });
  };
}
