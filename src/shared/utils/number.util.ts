export const randomInt = (min = 0, max = 10): number =>
  Math.round(Math.random() * (max - min)) + min;
