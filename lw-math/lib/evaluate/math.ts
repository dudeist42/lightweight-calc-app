import { toDegree, toRadian } from './utils';

export const add = (a: number, b: number) => a + b;
export const sub = (a: number, b: number) => a - b;
export const div = (a: number, b: number) => a / b;
export const mul = (a: number, b: number) => a * b;

export const pow = Math.pow;

export type TMeasure = 'deg' | 'rad';
export const root = (num: number, power: number) =>
  Math.abs(num) ** (1 / power) * (num < 0 ? -1 : 1);
export const sin = (a: number, measure?: TMeasure) =>
  round(Math.sin(measure === 'deg' ? toDegree(a) : a), 11);
export const cos = (a: number, measure?: TMeasure) =>
  round(Math.cos(measure === 'deg' ? toDegree(a) : a), 11);
export const tan = (a: number, measure?: TMeasure) => {
  const result = Math.tan(measure === 'deg' ? toDegree(a) : a);

  return result > Number.MAX_SAFE_INTEGER ? Number.POSITIVE_INFINITY : result;
};
export const arcsin = (a: number, measure?: TMeasure) => {
  if (a > 1 || a < -1) {
    throw new Error('Argument of arcsin expected value in range = -1 <= a <= 1');
  }

  const result = Math.asin(a);

  return measure === 'deg' ? toRadian(result) : result;
};
export const arccos = (a: number, measure?: TMeasure) => {
  if (a > 1 || a < -1) {
    throw new Error('Argument of acos expected value in range = -1 <= a <= 1');
  }
  const result = Math.acos(a);
  return measure === 'deg' ? toRadian(result) : result;
};
export const arctan = (a: number, measure?: TMeasure): number => {
  const result = Math.atan(a);

  return measure === 'deg' ? toRadian(result) : result;
};

export const sqrt = (a: number) => Math.sqrt(a);
export const ln = (a: number): number => Math.log(a);
export const log = (a: number): number => Math.log10(a);
export const round = (a: number, precision = 0): number => Number.parseFloat(a.toFixed(precision));
/**
 * Thanks to https://stackoverflow.com/a/15454866
 */
const gamma = (a: number): number => {
  // Accurate to about 15 decimal places
  // some magic constants
  let n = a;
  const g = 7; // G represents the precision desired, p is the values of p[i] to plug into Lanczos' formula
  const p = [
    0.999_999_999_999_809_93, 676.520_368_121_885_1, -1259.139_216_722_402_8,
    771.323_428_777_653_13, -176.615_029_162_140_59, 12.507_343_278_686_905,
    -0.138_571_095_265_720_12, 9.984_369_578_019_571_6e-6, 1.505_632_735_149_311_6e-7,
  ];
  if (n < 0.5) {
    return Math.PI / Math.sin(n * Math.PI) / gamma(1 - n);
  }

  n--;
  let x = p[0];
  for (let i = 1; i < g + 2; i++) {
    x += p[i] / (n + i);
  }

  const t = n + g + 0.5;
  return Math.sqrt(2 * Math.PI) * t ** (n + 0.5) * Math.exp(-t) * x;
};

export const factorial = (number: number): number => {
  const newLocal = number % 1 !== 0;
  if (newLocal) {
    return gamma(number + 1);
  }

  if (number === 0) {
    return 1;
  }

  let result = number;
  for (let i = Math.abs(number); --i; ) {
    result *= i;
  }

  return result;
};
