import {ConverterApi} from './converter.api';
import {Errors} from 'typescript-rest';

// Roman numerals MDCLXVI are each assigned a value:

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

// 0 is represented by the word 'nulla'
const nulla = 0;

/**
 *  A map of Roman-to-number for
 *  0 (nulla), base characters, and subtractives.
 */
const romanToNumber = { M, CM, D, CD, C, XC, L, XL, X, IX, V, IV, I, nulla };

/**
 *  A sparse array that maps number (array index) to Roman characters for
 *  0 (nulla), base characters, and subtractives.
 */
const numberToRoman = Object.entries(romanToNumber).reduce((n2r, [r, n]) => {
  n2r[n] = r;
  return n2r;
}, []);

export class ConverterService implements ConverterApi {
  /**
   * Left-to-right calculation (and validation) of number value given a Roman numeral string.
   * @param roman
   */
  #romanToNumberUsingMath(roman: string): number {
    let ret = 0;
    let least = Number.MAX_VALUE;

    roman = roman.toUpperCase(); // We allow mixed-case now. IKR!

    function throwInvalidChar(r: string) {
      throw new Errors.BadRequestError(`Invalid Roman character '${r}'`);
    }

    /**
     * Throw increasing values from left-to-right (using prev to next for subtractives).
     * @param current
     * @param next
     * @param least
     */
    function throwIncreasingChar(curr: number, next: number, least: number) {
      throw new Errors.BadRequestError(`Cannot go up: ${this.numberToRoman(least)} to ${this.numberToRoman(Math.max(curr, next))}`);
    }

    /**
     * When increasing values from left-to-right test for valid subtractive.
     * @param n
     */
    function throwInvalidSub(n: number) {
      if (![X, I, C].includes(n)) {
        throw new Errors.BadRequestError('Only X, I, and C can be subtractive');
      }
    }

    // Handle 'nulla' before it looks like invalid chars.
    if (roman === 'NULLA') {
      return 0;
    }

    // Validate characters and convert to numbers
    const numbers = [...roman].map(r => romanToNumber[r] || throwInvalidChar(r));
    for (let i = 0; i < numbers.length; i++) {
      let current = numbers[i];
      const next = numbers[i + 1] || 0;
      if (Math.max(current, next) > least) throwIncreasingChar(current, next, least);

      if (next > current) {
        // Handle subtractives (this char subtracted from next char)
        if (![X, I, C].includes(current)) throwInvalidSub(current);
        current = next - current;
        i++; // take both chars
      }
      least = current;
      ret += least;
    }

    // Lastly, catch silly invalid input that could get through the above code.
    // Numbers over 3999 are not valid with our rules
    if (ret > 3999) {
      throw new Errors.BadRequestError('Exceeds 3999');
    }
    // Reject if it had 4 in a row of anything
    const fours = ['MMMM', 'DDDD', 'CCCC', 'LLLL', 'XXXX', 'VVVV', 'IIII'];
    if (fours.some((four) => roman.includes(four))) {
      throw new Errors.BadRequestError(
        'Cannot repeat a character 4 times in a row'
      );
    }
    // Reject if it had 4 in a row of anything
    const singles = ['L', 'V', 'D'];
    if (singles.some((single) => roman.split(single).length > 2)) {
      throw new Errors.BadRequestError(
        'Characters L, V, and D can only be used once'
      );
    }

    return ret;
  }

  /**
   * Calculate a number from a Roman numeral string.
   */
  toNumber(roman: string): number {
    if (!roman) {
      throw new Errors.BadRequestError(
        'A non-empty Roman numeral string is required'
      );
    }
    return this.#romanToNumberUsingMath(roman);
  }

  /**
   * Generate a Roman numeral string from a number.
   */
  toRoman(n: number): string {
    if (!Number.isInteger(n) || n < 0 || n >= 4000) {
      throw new Errors.BadRequestError('Only integers from 0-3999 are allowed');
    }

    // The Roman numeral string to return
    let roman = '';
    let remainder: number = n;

    // Repeat each Roman character/subtractive as needed (big to small).
    [M, CM, D, CD, C, XC, L, XL, X, IX, V, IV, I].forEach((value) => {
      // NOTE: Using number instead of bigint means we need to be careful of float ops
      roman += numberToRoman[value].repeat(Math.trunc(remainder / value));
      remainder = remainder % value;
    });

    return roman || numberToRoman[nulla];
  }
}
