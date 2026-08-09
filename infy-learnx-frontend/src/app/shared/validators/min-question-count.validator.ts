import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormArray } from '@angular/forms';

// frontend-tasks.md L-01: applied to a Quiz form's `questions` FormArray —
// at least one question is required.
export const minQuestionCountValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const array = control as FormArray;
  return array.length === 0 ? { minQuestions: true } : null;
};
