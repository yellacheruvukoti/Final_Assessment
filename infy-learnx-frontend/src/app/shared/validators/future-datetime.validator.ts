import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// frontend-tasks.md L-01: used for Quiz's optional `scheduledAt` field —
// only validated when a value is provided.
export const futureDatetimeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (!value) {
    return null;
  }
  return new Date(value).getTime() > Date.now() ? null : { pastDatetime: true };
};
