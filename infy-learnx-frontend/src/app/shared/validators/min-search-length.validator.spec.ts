import { FormControl } from '@angular/forms';

import { minSearchLengthValidator } from './min-search-length.validator';

describe('minSearchLengthValidator', () => {
  it('returns null when empty', () => {
    expect(minSearchLengthValidator(new FormControl(''))).toBeNull();
    expect(minSearchLengthValidator(new FormControl(null))).toBeNull();
  });

  it('returns an error for a single character', () => {
    expect(minSearchLengthValidator(new FormControl('a'))).toEqual({ minSearchLength: true });
  });

  it('returns null for 2 or more characters', () => {
    expect(minSearchLengthValidator(new FormControl('ab'))).toBeNull();
    expect(minSearchLengthValidator(new FormControl('abc'))).toBeNull();
  });
});
