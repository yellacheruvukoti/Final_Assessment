import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// frontend-tasks.md L-01: FormGroup-level validator for Assessment
// Create/Edit's startTime/endTime pair. Sets/clears `endBeforeStart` on the
// endTime control itself (so the error renders next to that field) in
// addition to returning it at the group level.
export const endAfterStartValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const startControl = group.get('startTime');
  const endControl = group.get('endTime');
  if (!startControl || !endControl) {
    return null;
  }

  const start = startControl.value;
  const end = endControl.value;
  if (!start || !end) {
    clearEndBeforeStart(endControl);
    return null;
  }

  const isInvalid = new Date(end).getTime() <= new Date(start).getTime();
  if (isInvalid) {
    endControl.setErrors({ ...endControl.errors, endBeforeStart: true });
    return { endBeforeStart: true };
  }

  clearEndBeforeStart(endControl);
  return null;
};

function clearEndBeforeStart(control: AbstractControl): void {
  if (!control.errors?.['endBeforeStart']) {
    return;
  }
  const { endBeforeStart: _removed, ...rest } = control.errors;
  control.setErrors(Object.keys(rest).length > 0 ? rest : null);
}
