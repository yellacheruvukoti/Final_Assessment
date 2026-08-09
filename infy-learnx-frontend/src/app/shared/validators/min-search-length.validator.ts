import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// frontend-tasks.md L-01: guards against a single-character search query
// (0 chars is just "no search", 2+ is a valid search term).
export const minSearchLengthValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value ?? '';
  return value.length === 1 ? { minSearchLength: true } : null;
};
