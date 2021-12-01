import { ConverterApi } from './converter.api';
import { Errors } from 'typescript-rest';

// Roman numerals are a number system used by the Roman Empire, based on letters M D C L X V I.
// "My Dear Cat Loves eXtra Vitamins Intensely" just might help you remember them in order.
// Each of these letters is assigned a value:

const M = 1000; // my
const D = 500; // dear
const C = 100; // cat
const L = 50; // loves
const X = 10; // extra
const V = 5; // vitamins
const I = 1; // intensely(?)

// ...and you represent numbers by combining these letters:
/** This sparse array maps number (array index) to Roman for
 *  base characters, 0, 1-21, and other significant and common combinations.
 */
const numberToRoman = [];
numberToRoman[I] = 'I';
numberToRoman[2] = 'II';
numberToRoman[3] = 'III';
numberToRoman[4] = 'IV';
numberToRoman[V] = 'V';
numberToRoman[6] = 'VI';
numberToRoman[7] = 'VII';
numberToRoman[8] = 'VIII';
numberToRoman[9] = 'IX';
numberToRoman[X] = 'X';
numberToRoman[11] = 'XI';
numberToRoman[12] = 'XII';
numberToRoman[13] = 'XIII';
numberToRoman[14] = 'XIV';
numberToRoman[15] = 'XV';
numberToRoman[16] = 'XVI';
numberToRoman[17] = 'XVII';
numberToRoman[18] = 'XVIII';
numberToRoman[19] = 'XIX';
numberToRoman[20] = 'XX';
numberToRoman[21] = 'XXI';

// There is no Roman Numeral for the number 0, instead they wrote nulla (the Latin word meaning none).

numberToRoman[0] = 'nulla';

// Add the higher base characters M, D, C, and L

numberToRoman[L] = 'L';
numberToRoman[C] = 'C';
numberToRoman[D] = 'D';
numberToRoman[M] = 'M';

// Roman numerals are read left to right, with higher values being placed before lower values.
// To get the number represented by the numeral add the individual values together.
// One exception to this rule is when you want a 4 or 9.
// Roman Numbers don't allow more than 3 consecutive occurrences of the same letter,
// so you take the next value up and subtract 1.
// So for 4 you use the letter for 5 = V and subtract 1, which appears before the V to give IV,
// similarly for 9 you take 10 and subtract 1 to give IX.
// This also works for 40 (XL), 90 (XC), 400 (CD) and 900 (CM).

const CM = 900;
const CD = 400;
const XC = 90;
const XL = 40;
const IX = 9;
const IV = 4;

// Add the common combinations to the quick look-up sparse array (0-21 already added)

numberToRoman[XL] = 'XL';
numberToRoman[XC] = 'XC';
numberToRoman[CD] = 'CD';
numberToRoman[CM] = 'CM';

/** A map for common Roman-to-number conversions built from the number-to-Roman sparse array. */
const romanToNumber = {};
numberToRoman.map((r, n) => {
  romanToNumber[r] = n;
});

export class ConverterService implements ConverterApi {
  /**
   * Generate a Roman numeral string from a number.
   * @param n
   */
  #numberToRomanUsingMath(n: number): string {
    let remainder: number = n; // NOTE: Using number instead of bigint means we need to be careful of float ops

    // List of chars/combos to loop through in order (big to small) for calculation.
    const romans: number[] = [M, CM, D, CD, C, XC, L, XL, X, IX, V, IV, I];

    // How many of each Roman character/combo (above) we need (big to small).
    const times: number[] = [];

    // Determine how many times each Roman character/combo is needed.
    romans.forEach((r) => {
      times.push(Math.trunc(remainder / r));
      remainder = remainder % r;
    });

    // The Roman numeral string to return
    let ret = '';

    // Build the Roman numeral string to return
    times.forEach((count, idx) => {
      ret += numberToRoman[romans[idx]].repeat(count);
    });

    return ret;
  }

  /**
   * Left-to-right calculation (and validation) of number value given a Roman numeral string.
   * @param roman
   */
  #romanToNumberUsingMath(roman: string): number {
    let ret = 0;
    let last = Number.MAX_VALUE;

    for (let i = 0; i < roman.length; i++) {
      const n: number = romanToNumber[roman.charAt(i)];
      if (n === undefined) {
        throw new Errors.BadRequestError('Bad character zzzzz');
      }
      // Look ahead for subtraction like IX
      const next: string = roman.charAt(i + 1);
      if (!next) {
        if (n > last) {
          throw new Errors.BadRequestError('Cannot go up');
        }
        // last = n;  // Done
        ret += n;
      } else {
        const m = romanToNumber[next];
        if (!m) {
          throw new Errors.BadRequestError('Bad next character');
        } else if (m > n) {
          // TODO: This needs some limits on how it is used.
          if (![X, I, C].includes(n) && m > n) {
            // Only X, I, C can be subtractive
            throw new Errors.BadRequestError('Cannot go up: ' + roman);
          } else if (m === V && m >= last) {
            // Cannot go up or do VIV
            throw new Errors.BadRequestError('Cannot go up: ' + roman);
          } else if (m === X && m > last) {
            // Cannot go up, but can do XIX
            throw new Errors.BadRequestError('Cannot go up: ' + roman);
          }
          ret += m;
          ret -= n;
          i++;
          last = m - n;
        } else {
          if (n > last) {
            throw new Errors.BadRequestError('Cannot go up: ' + roman);
          }
          last = n;
          ret += n;
        }
      }
    }

    // Numbers over 3999 are not valid with our rules
    if (ret > 3999) {
      throw new Errors.BadRequestError();
    }

    // Reject if it had 4 in a row of anything
    const fours = ['MMMM', 'DDDD', 'CCCC', 'LLLL', 'XXXX', 'VVVV', 'IIII'];
    if (fours.some((four) => roman.includes(four))) {
      throw new Errors.BadRequestError();
    }

    return ret;
  }

  toNumber(roman: string): number {
    if (!roman) {
      throw new Errors.BadRequestError(
        'A non-empty Roman numeral string is required'
      );
    }
    const n: number = romanToNumber[roman];
    return Number.isInteger(n) ? n : this.#romanToNumberUsingMath(roman); // isInteger() here distinguishes 0 from undefined
  }

  toRoman(n: number): string {
    if (!Number.isInteger(n) || n < 0 || n >= 4000) {
      throw new Errors.BadRequestError('Only integers from 0-3999 are allowed');
    }

    // Try a quick lookup for base chars and common strings, else calculate.
    return numberToRoman[n] || this.#numberToRomanUsingMath(n);
  }
}
