import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { correctKeyMatchesOptionValidator } from './correct-key-matches.validator';

describe('correctKeyMatchesOptionValidator', () => {
  function buildGroup(options: string[], correctAnswerKey: string | null): FormGroup {
    return new FormGroup(
      {
        options: new FormArray(options.map((o) => new FormControl(o))),
        correctAnswerKey: new FormControl(correctAnswerKey),
      },
      { validators: correctKeyMatchesOptionValidator },
    );
  }

  it('returns an error when the key is not among the options', () => {
    const group = buildGroup(['Paris', 'London'], 'Berlin');
    expect(group.errors).toEqual({ keyMismatch: true });
    expect(group.get('correctAnswerKey')?.errors).toEqual({ keyMismatch: true });
  });

  it('returns null when the key exists among the options', () => {
    const group = buildGroup(['Paris', 'London'], 'Paris');
    expect(group.errors).toBeNull();
    expect(group.get('correctAnswerKey')?.errors).toBeNull();
  });

  it('returns null when the key is empty', () => {
    const group = buildGroup(['Paris', 'London'], null);
    expect(group.errors).toBeNull();
  });
});
