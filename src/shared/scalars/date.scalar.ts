import { Scalar, CustomScalar } from '@nestjs/graphql';
import dayjs from 'dayjs';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<string, Date> {
  description = 'Date custom scalar type';

  parseValue(value: number | string): Date {
    return new Date(value); // value from the client
  }

  serialize(value: Date): string {
    return dayjs(value).format('YYYY-MM-DD HH:mm:ss'); // value sent to the client
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
}
