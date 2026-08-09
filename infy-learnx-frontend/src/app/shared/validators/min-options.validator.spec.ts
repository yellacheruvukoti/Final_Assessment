import { FormArray, FormControl } from '@angular/forms';

import { minOptionsValidator } from './min-options.validator';

describe('minOptionsValidator', () => {
  it('returns an error for 0 or 1 option', () => {
    expect(minOptionsValidator(new FormArray<FormControl>([]))).toEqual({ minOptions: true });
    expect(minOptionsValidator(new FormArray<FormControl>([new FormControl('a')]))).toEqual({
      minOptions: true,
    });
  });

  it('returns null for 2 or more options', () => {
    const array = new FormArray<FormControl>([new FormControl('a'), new FormControl('b')]);
    expect(minOptionsValidator(array)).toBeNull();
  });
});
