import { FormControl } from '@angular/forms';

import { positiveIntegerValidator } from './positive-integer.validator';

describe('positiveIntegerValidator', () => {
  it('returns null for null, undefined, and empty string', () => {
    expect(positiveIntegerValidator(new FormControl(null))).toBeNull();
    expect(positiveIntegerValidator(new FormControl(undefined))).toBeNull();
    expect(positiveIntegerValidator(new FormControl(''))).toBeNull();
  });

  it('returns an error for 0, negative, non-integer, and non-numeric values', () => {
    expect(positiveIntegerValidator(new FormControl(0))).toEqual({ positiveInteger: true });
    expect(positiveIntegerValidator(new FormControl(-1))).toEqual({ positiveInteger: true });
    expect(positiveIntegerValidator(new FormControl(1.5))).toEqual({ positiveInteger: true });
    expect(positiveIntegerValidator(new FormControl('abc'))).toEqual({ positiveInteger: true });
  });

  it('returns null for positive integers', () => {
    expect(positiveIntegerValidator(new FormControl(1))).toBeNull();
    expect(positiveIntegerValidator(new FormControl(100))).toBeNull();
  });
});
