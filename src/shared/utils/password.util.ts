import { genSaltSync, hashSync } from 'bcrypt';

export const hashPassword = (password: string) =>
  hashSync(password, genSaltSync(10));
