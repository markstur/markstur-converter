import { Errors } from 'typescript-rest';

export const invalidChar = (r: string) => {
  throw new Errors.BadRequestError(`Invalid Roman character '${r}'`);
};

export const increasingChar = function (
  curr: number,
  next: number,
  least: number
) {
  throw new Errors.BadRequestError(
    `Cannot go up: ${least} to ${Math.max(curr, next)}`
  );
};

export const invalidSub = () => {
  throw new Errors.BadRequestError('Only X, I, and C can be subtractive');
};

export const invalidQuad = () => {
  throw new Errors.BadRequestError(
    'Cannot repeat a character 4 times in a row'
  );
};

export const invalidRepeat = () => {
  throw new Errors.BadRequestError(
    'Characters L, V, and D can only be used once'
  );
};

export const exceeds3999 = () => {
  throw new Errors.BadRequestError('Exceeds 3999');
};

export const invalidNumber = () => {
  throw new Errors.BadRequestError('Only integers from 0-3999 are allowed');
};

export const emptyString = () => {
  throw new Errors.BadRequestError(
    'A non-empty Roman numeral string is required'
  );
};
