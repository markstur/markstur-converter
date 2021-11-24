import { Container } from 'typescript-ioc';
import { BadRequestError } from 'typescript-rest/dist/server/model/errors';

import { ConverterService } from '../../src/services/converter.service';

describe('Converter service', () => {
  let service: ConverterService;
  beforeAll(() => {
    service = Container.get(ConverterService);
  });

  test('canary test verifies test infrastructure', () => {
    expect(service).not.toBeUndefined();
  });

  describe('Each of these letters is assigned a value (MDCLXVI)', () => {
    context('when valid single letter provided', () => {
      test.each([
        ['M', 1000],
        ['D', 500],
        ['C', 100],
        ['L', 50],
        ['X', 10],
        ['V', 5],
        ['I', 1],
      ])('toNumber(%s) should result in %s', async (s, expected) => {
        expect(await service.toNumber(s)).toBe(expected);
      });
    });
  });

  describe('and you represent numbers by combining these letters (up to 21)', () => {
    context('when valid combined letters up to 21 provided', () => {
      test.each([
        ['I', 1],
        ['II', 2],
        ['III', 3],
        ['IV', 4],
        ['V', 5],
        ['VI', 6],
        ['VII', 7],
        ['VIII', 8],
        ['IX', 9],
        ['X', 10],
        ['XI', 11],
        ['XII', 12],
        ['XIII', 13],
        ['XIV', 14],
        ['XV', 15],
        ['XVI', 16],
        ['XVII', 17],
        ['XVIII', 18],
        ['XIX', 19],
        ['XX', 20],
        ['XXI', 21],
      ])('toNumber(%s) should result in %s', async (s, expected) => {
        expect(await service.toNumber(s)).toBe(expected);
      });
    });
  });

  describe('There is no Roman Numeral for the number 0, instead they wrote "nulla" (the Latin word meaning none).', () => {
    context('when given 0', () => {
      test('then return "nulla"', async () => {
        expect(await service.toRoman(0)).toEqual('nulla');
      });
    });
  });

  describe('Roman numerals are read left to right, with higher values being placed before lower values. To get the number represented by the numeral add the individual values together.', () => {
    context('Given left-to-right example "MMDCCLXVIII"', () => {
      test('then return 2768', async () => {
        expect(await service.toNumber('MMDCCLXVIII')).toEqual(2768);
      });
    });
  });

  describe('One exception to this rule is when you want a 4 or 9.', () => {
    context('when given IV or IX', () => {
      test.each([
        ['IV', 4],
        ['IX', 9],
      ])('toNumber(%s) should result in %s', async (s, expected) => {
        expect(await service.toNumber(s)).toBe(expected);
      });
    });
  });

  describe("Roman Numbers don't allow more than 3 consecutive occurrences of the same letter, so you take the next value up and subtract 1.", () => {
    // So for 4 you use the letter for 5 = V and subtract 1, which appears before the V to give IV,
    // similarly for 9 you take 10 and subtract 1 to give IX. This also works for 40 (XL), 90 (XC), 400 (CD) and 900 (CM).
    context('when given IV, IX, XL, XC, CD, CM', () => {
      test.each([
        ['IV', 4],
        ['IX', 9],
        ['XL', 40],
        ['XC', 90],
        ['CD', 400],
        ['CM', 900],
      ])('toNumber(%s) should result in %s', async (s, expected) => {
        expect(await service.toNumber(s)).toBe(expected);
      });
    });
    context('when given MCMXCIV', () => {
      test('toNumber(MCMXCIV) should result in 1994', async () => {
        expect(await service.toNumber('MCMXCIV')).toBe(1994);
      });
    });
  });

  describe('MMMCMXCIX (3999) is the largest number you can support without needing to introduce the bar', () => {
    context('when given MMMCMXMIX', () => {
      test('toNumber(MMMCMXCIX) should result in 3999', async () => {
        expect(await service.toNumber('MMMCMXCIX')).toBe(3999);
      });
    });
  });

  describe('More than 3 in a row is not allowed', () => {
    context('when given MXXXXVI', () => {
      test('toNumber(MXXXXVI) should result in throw 400', () => {
        expect(() => service.toNumber('MXXXXVI')).toThrow(BadRequestError);
      });
      test('toNumber(MMMM) should result in throw 400', () => {
        expect(() => service.toNumber('MMMM')).toThrow(BadRequestError);
      });
      test('toNumber(MMMMX) should result in throw 400', () => {
        expect(() => service.toNumber('MMMMX')).toThrow(BadRequestError);
      });
      test('toNumber(DDDD) should result in throw 400', () => {
        expect(() => service.toNumber('DDDD')).toThrow(BadRequestError);
      });
      test('toNumber(DDDDX) should result in throw 400', () => {
        expect(() => service.toNumber('DDDDX')).toThrow(BadRequestError);
      });
      test('toNumber(CCCC) should result in throw 400', () => {
        expect(() => service.toNumber('CCCC')).toThrow(BadRequestError);
      });
      test('toNumber(CCCCX) should result in throw 400', () => {
        expect(() => service.toNumber('CCCCX')).toThrow(BadRequestError);
      });
      test('toNumber(LLLL) should result in throw 400', () => {
        expect(() => service.toNumber('LLLL')).toThrow(BadRequestError);
      });
      test('toNumber(LLLLX) should result in throw 400', () => {
        expect(() => service.toNumber('LLLLX')).toThrow(BadRequestError);
      });
      test('toNumber(XXXX) should result in throw 400', () => {
        expect(() => service.toNumber('XXXX')).toThrow(BadRequestError);
      });
      test('toNumber(XXXXV) should result in throw 400', () => {
        expect(() => service.toNumber('XXXXV')).toThrow(BadRequestError);
      });
      test('toNumber(VVVV) should result in throw 400', () => {
        expect(() => service.toNumber('VVVV')).toThrow(BadRequestError);
      });
      test('toNumber(VVVVI) should result in throw 400', () => {
        expect(() => service.toNumber('VVVVI')).toThrow(BadRequestError);
      });
      test('toNumber(XIIII) should result in throw 400', () => {
        expect(() => service.toNumber('XIIII')).toThrow(BadRequestError);
      });
      test('toNumber(IIII) should result in throw 400', () => {
        expect(() => service.toNumber('IIII')).toThrow(BadRequestError);
      });
    });
  });

  describe('Must decrease going left', () => {
    context('when given XXXVIV', () => {
      test('toNumber(XXXVIV) should result in throw 400', () => {
        expect(() => service.toNumber('XXXVIV')).toThrow(BadRequestError);
      });
    });
  });

  // TODO: Not really testing for increasing letters to the right (enforcing left-to-right rules)
  // TODO: Not testing for repeating a subtraction car like IIIV.
  // TODO: Not testing for repeating a subtraction car like IIIV.

  // TODO: *** The internet found some more rules that were not part of the assignment ***
  // TODO: The letters I, X, C can be repeated thrice in succession. Additionally, L, V, D cannot be repeated or the number is considered to be invalid.
  // TODO: If a lower value digit is written to the left of a higher value digit, it is subtracted.
  // TODO: If a lower value digit is written to the right of a higher value digit, it is added.
  // TODO: Only I, X, and C can be used as subtractive numerals.

  //
  describe('Given INVALID toNumber(string)', () => {
    context('when invalid strings/characters are provided', () => {
      test('undefined returns throw 400', () => {
        expect(() => service.toNumber(undefined)).toThrow(BadRequestError);
      });
      test('empty string returns throw 400', () => {
        expect(() => service.toNumber('')).toThrow(BadRequestError);
      });
      test('"A" returns throw 400', () => {
        expect(() => service.toNumber('A')).toThrow(BadRequestError);
      });
      test('"XZI" returns throw 400', () => {
        expect(() => service.toNumber('XZI')).toThrow(BadRequestError);
      });
      test('"X I" returns throw 400', () => {
        expect(() => service.toNumber('X I')).toThrow(BadRequestError);
      });
      test('"X.I" returns throw 400', () => {
        expect(() => service.toNumber('X I')).toThrow(BadRequestError);
      });
      test('"XvI" returns throw 400', () => {
        expect(() => service.toNumber('X I')).toThrow(BadRequestError);
      });
    });
  });

  describe('Given OUT-OF-RANGE toRoman(n)', () => {
    context('when out-of-range numbers are provided', () => {
      test('-99999999 returns throw 400', () => {
        expect(() => service.toRoman(-99999999)).toThrow(BadRequestError);
      });
      test('-1 returns throw 400', () => {
        expect(() => service.toRoman(-1)).toThrow(BadRequestError);
      });
      test('99999999 returns throw 400', () => {
        expect(() => service.toRoman(99999999)).toThrow(BadRequestError);
      });
      test('4000 returns throw 400', () => {
        expect(() => service.toRoman(4000)).toThrow(BadRequestError);
      });
    });
  });

  describe('Given NOT-AN-INTEGER toRoman(n)', () => {
    context('when non-integer numbers are provided', () => {
      test('-0.9 returns throw 400', () => {
        expect(() => service.toRoman(-0.9)).toThrow(BadRequestError);
      });
      test('9.9 returns throw 400', () => {
        expect(() => service.toRoman(9.9)).toThrow(BadRequestError);
      });
    });
  });

  // TODO: Determine if floats w/ only zeros after decimal are OK
  describe('DOT-ZERO floats are okay??? toRoman(n.0)', () => {
    context('when non-integer numbers are provided', () => {
      test('0.0 is not undefined', async () => {
        expect(service.toRoman(0.0)).not.toEqual(undefined);
      });
      test('1.0 is not undefined', async () => {
        expect(service.toRoman(1.0)).not.toEqual(undefined);
      });
    });
  });

  describe('INVERSE FUNCTIONS SO n == toNumber(toRoman(n))', () => {
    context('0-39 toRoman and back toNumber', () => {
      // HINT: try 3999!
      test.each(Array.from(Array(40).keys()))(
        'toNumber(toRoman(n)) should result in self n=%s',
        (n) => {
          expect(service.toNumber(service.toRoman(n))).toBe(n);
        }
      );
    });
  });
});
