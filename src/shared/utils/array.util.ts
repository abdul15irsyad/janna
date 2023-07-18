import { randomInt } from './number.util';

export const random = <T>(array: T[]) => array[randomInt(0, array.length - 1)];

export const shuffle = <T>(array: T[]) => array.sort(() => Math.random() - 0.5);
