import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// frontend-tasks.md L-01: null/empty passes (required is a separate
// concern); 0, negatives, non-integers, and non-numeric input all fail.
export const positiveIntegerValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? null : { positiveInteger: true };
};
