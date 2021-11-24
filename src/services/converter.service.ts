import {ConverterApi} from './converter.api';
import {Inject} from 'typescript-ioc';
import {LoggerApi} from '../logger';
import {Errors} from 'typescript-rest';

const M = 1000;  // my
const CM = 900;
const D = 500; // dear
const CD = 400;
const C = 100; // cat
const XC = 90; //
const LC = 50; //
const L = 50; // loves
const XL = 40;
const X = 10; // extra
const IX = 9;
const V = 5; // vitamins
const IV = 4;
const I = 1; // intensely?

// Quick look-up sparse array mappings the base chars and combos (number to roman)
const sparseN2R = [];
sparseN2R[0] = 'nulla';
sparseN2R[I] = 'I';
sparseN2R[2] = 'II';
sparseN2R[3] = 'III';
sparseN2R[IV] = 'IV';
sparseN2R[V] = 'V';
sparseN2R[6] = 'VI';
sparseN2R[7] = 'VII';
sparseN2R[8] = 'VIII';
sparseN2R[IX] = 'IX';
sparseN2R[X] = 'X';
sparseN2R[11] = 'XI';
sparseN2R[12] = 'XII';
sparseN2R[13] = 'XIII';
sparseN2R[14] = 'XIV';
sparseN2R[15] = 'XV';
sparseN2R[16] = 'XVI';
sparseN2R[17] = 'XVII';
sparseN2R[18] = 'XVIII';
sparseN2R[19] = 'XIX';
sparseN2R[20] = 'XX';
sparseN2R[21] = 'XXI';
sparseN2R[L] = 'L';
sparseN2R[C] = 'C';
sparseN2R[D] = 'D';
sparseN2R[M] = 'M';
sparseN2R[40] = 'XL';
sparseN2R[50] = 'LC';
sparseN2R[90] = 'XC';
sparseN2R[400] = 'CD';
sparseN2R[900] = 'CM';
// console.log("SPARSE: ", sparseN2R);

// const r2nMap : Map<string, number> = new Map([
  // 'I':1,II:2,III:3,IV:4,V:5,VI:6,VII:7,VIII:8,IX:9,X:10,
  // 'XI':11,XII:12,XIII:13,XIV:14,XV:15,XVI:16,XVII:17,XVIII:18,XIX:19,XX:20,XXI:21,
  // C:100,D:500,L:50,M:1000,
  // XL:40,XC:90,CD:400,CM:900
// };
// 

// TODO: My intention was to build the N2R from R2N or vice versa
// TODO: Also I guess if I do a typescript map, I need to change this (and maybe can use map instead of sparse array above)
const r2nMap = {
  nulla:0,
  I:1,II:2,III:3,IV:4,V:5,VI:6,VII:7,VIII:8,IX:9,X:10,
  XI:11,XII:12,XIII:13,XIV:14,XV:15,XVI:16,XVII:17,XVIII:18,XIX:19,XX:20,XXI:21,
  C:100,D:500,L:50,M:1000,
  XL:40,XC:90,CD:400,CM:900
};

export class ConverterService implements ConverterApi {
  logger: LoggerApi;

  constructor(
    @Inject
    logger: LoggerApi,
  ) {
    this.logger = logger.child('ConverterService');
  }

  numberToRomanWithMath(n: number): string {

    // NOTE: Using number instead of bigint means we need to be careful of float ops

    let m = Math.trunc(n / M);
    let remainder = n % M;

    let cm = Math.trunc(remainder / CM);
    remainder = remainder - (cm * CM);  // Just subtract the one, if any

    let d = Math.trunc(remainder / D);
    remainder = remainder % D;

    let cd = Math.trunc(remainder / CD);
    remainder = remainder - (cd * CD);  // Just subtract the one, if any

    let c = Math.trunc(remainder / C);
    remainder = remainder % C;

    let lc = Math.trunc(remainder / LC);
    remainder = remainder - (lc * LC);  // Just subtract the one, if any

    let xc = Math.trunc(remainder / XC);
    remainder = remainder - (xc * XC);  // Just subtract the one, if any

    let l = Math.trunc(remainder / L);
    remainder = remainder % L;

    let xl = Math.trunc(remainder / XL);
    remainder = remainder - (xl * XL);  // Just subtract the one, if any

    let x = Math.trunc(remainder / X);
    remainder = remainder % X;

    let ix = Math.trunc(remainder / IX);
    remainder = remainder - (ix * IX);  // Just subtract the one, if any

    let v = Math.trunc(remainder / V);
    remainder = remainder % V;

    let iv = Math.trunc(remainder / IV);
    remainder = remainder - (iv * IV);  // Just subtract the one, if any

    let i = Math.trunc(remainder / I);

    let ret : string = ''
    ret += 'M'.repeat(m)
    ret += 'CM'.repeat(cm)
    ret += 'D'.repeat(d)
    ret += 'CD'.repeat(cd)
    ret += 'C'.repeat(c)
    ret += 'LC'.repeat(lc)
    ret += 'L'.repeat(l)
    ret += 'XL'.repeat(xl)
    ret += 'X'.repeat(x)
    ret += 'IX'.repeat(ix)
    ret += 'V'.repeat(v)
    ret += 'IV'.repeat(iv)
    ret += 'I'.repeat(i)

    // console.log("RETURNING: ", ret, " FOR ", n);
    return ret
  }

  leftToRight(roman: string): number {
    let ret: number = 0;
    let last = Number.MAX_VALUE;

    for (var i = 0; i < roman.length; i++) {
      let n: number = r2nMap[roman.charAt(i)]
      if (!n) {
        throw new Errors.BadRequestError();
      }
      // Look ahead for subtraction like IX
      let next: string = roman.charAt(i+1)
      if (!next) {
        if (n > last) {
          throw new Errors.BadRequestError("Cannot go up");
        }
        // last = n;  // Done
        ret += n;
      }
      else {
        let m = r2nMap[next];
        if (!m) {
          throw new Errors.BadRequestError("Cannot go up");
        }
        else if (m > n) {
          // TODO: This needs some limits on how it is used.
          if (m === V && m >= last) {
            // Cannot go up or do VIV
            throw new Errors.BadRequestError("Cannot go up");
          }
          else if (m === X && m > last) {
            // Cannot go up, but can do XIX
            throw new Errors.BadRequestError("Cannot go up");
          }
          ret += m;
          ret -= n;
          i++;
          last = m - n;
        }
        else {
          if (n > last) {
            throw new Errors.BadRequestError("Cannot go up");
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
    let fours = ['MMMM', 'DDDD', 'CCCC', 'LLLL', 'XXXX', 'VVVV', 'IIII'];
    if (fours.some(four => roman.includes(four))) {
      throw new Errors.BadRequestError();
    }

    return ret;
  }

  toNumber(roman: string): number {
    this.logger.info(`toNumber from: ${roman}`);
    if (!roman) {
      throw new Errors.BadRequestError();
    }
    let n: number = r2nMap[roman];
    return Number.isInteger(n) ? n : this.leftToRight(roman);  // isInteger() here distinguishes 0 from undefined
  }

  toRoman(n: number): string {
    this.logger.info('toRoman from: ${n}');

    if (!Number.isInteger(n) || n < 0 || n >= 4000) {
      throw new Errors.BadRequestError();
    }

    return sparseN2R[n] || this.numberToRomanWithMath(n);
  }
}
