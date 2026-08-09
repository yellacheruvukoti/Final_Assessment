import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormArray } from '@angular/forms';

// frontend-tasks.md L-01: applied to a quiz question's `options` FormArray
// when questionType is MCQ — at least 2 options are required.
export const minOptionsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const array = control as FormArray;
  return array.length < 2 ? { minOptions: true } : null;
};
