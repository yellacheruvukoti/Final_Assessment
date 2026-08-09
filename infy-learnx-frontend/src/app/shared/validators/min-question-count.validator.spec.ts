import { FormArray, FormControl } from '@angular/forms';

import { minQuestionCountValidator } from './min-question-count.validator';

describe('minQuestionCountValidator', () => {
  it('returns an error for an empty FormArray', () => {
    const array = new FormArray<FormControl>([]);
    expect(minQuestionCountValidator(array)).toEqual({ minQuestions: true });
  });

  it('returns null once at least one item is present', () => {
    const array = new FormArray<FormControl>([new FormControl('question')]);
    expect(minQuestionCountValidator(array)).toBeNull();
  });
});
