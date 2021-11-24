export abstract class ConverterApi {
  abstract toNumber(roman: string): number;
  abstract toRoman(n: number): string;
}
