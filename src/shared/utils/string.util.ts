import { FindOptionsOrderValue } from 'typeorm';

export const parseOrderBy = (
  orderBy: string,
  orderDir: FindOptionsOrderValue,
) => {
  if (!orderBy) return undefined;
  return orderBy.split('.').length === 1
    ? { [orderBy]: { direction: orderDir, nulls: 'last' } }
    : {
        [orderBy.split('.')[0]]: parseOrderBy(
          orderBy.split('.').slice(1).join('.'),
          orderDir,
        ),
      };
};
