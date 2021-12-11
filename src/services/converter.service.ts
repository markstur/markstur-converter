import { ConverterApi } from './converter.api';
import * as throws from './converter.errors';

const M = 1000;
const D = 500;
const C = 100;
const L = 50;
const X = 10;
const V = 5;
const I = 1;

// 4* and 9* are special subtractives (i.e. we need IX instead of invalid VIIII)

const CM = M - C;
const CD = D - C;
const XC = C - X;
const XL = L - X;
const IX = X - I;
const IV = V - I;

// 'nulla' is used for zero
const nulla = 'nulla';
// NULLA is used for case-insensitive compare
const NULLA = nulla.toUpperCase();

/**
 *  A lookup map of Roman-to-number for base characters and subtractives.
 */
const romanToNumber = { M, CM, D, CD, C, XC, L, XL, X, IX, V, IV, I };

/**
 *  A sparse array that maps number (array index) to Roman characters for
 *  base characters and subtractives.
 */
const numberToRoman = Object.entries(romanToNumber).reduce((n2r, [r, n]) => {
  n2r[n] = r;
  return n2r;
}, []);

export class ConverterService implements ConverterApi {
  /**
   * Calculate a number from a Roman numeral string.
   */
  toNumber(roman: string): number {
    if (!roman) throws.emptyString();
    roman = roman.toUpperCase(); // We allow mixed-case now. IKR!
    if (roman === NULLA) return 0;
    if (['M', 'C', 'X', 'I'].some((c) => roman.includes(c.repeat(4))))
      throws.invalidQuad();
    if (['D', 'L', 'V'].some((c) => roman.split(c).length > 2))
      throws.invalidRepeat();
    const numbers = [...roman].map(
      (r) => romanToNumber[r] || throws.invalidChar(r)
    );

    // Number to return
    let ret = 0;
    let least = Number.MAX_VALUE;
    for (let i = 0; i < numbers.length; i++) {
      let current = numbers[i];
      const next = numbers[i + 1] || 0;
      if (Math.max(current, next) > least)
        throws.increasingChar(current, next, least);
      if (next > current) {
        // handle subtractives
        if (![X, I, C].includes(current)) throws.invalidSub();
        current = next - current;
        i++;
      }
      least = current;
      ret += current;
    }

    if (ret > 3999) throws.exceeds3999();
    return ret;
  }

  /**
   * Generate a Roman numeral string from a number.
   */
  toRoman(n: number): string {
    if (!Number.isInteger(n) || n < 0 || n >= 4000) throws.invalidNumber();
    if (n === 0) return nulla;

    // The Roman numeral string to return
    let roman = '';
    let remainder: number = n;

    // Repeat each Roman character/subtractive as needed (big to small).
    [M, CM, D, CD, C, XC, L, XL, X, IX, V, IV, I].forEach((value) => {
      roman += numberToRoman[value].repeat(Math.trunc(remainder / value));
      remainder = remainder % value;
    });

    return roman;
  }
}
