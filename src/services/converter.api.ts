export abstract class ConverterApi {
  /**
   * Convert a Roman numeral string to a number.
   * @param roman
   */
  abstract toNumber(roman: string): number;
  /**
   * Convert a number to a Roman numeral string.
   * @param n
   */
  abstract toRoman(n: number): string;
}
