import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormArray } from '@angular/forms';

// frontend-tasks.md L-01: FormGroup-level validator for a quiz question —
// `correctAnswerKey` must match one of the values in the `options`
// FormArray. Sets/clears `keyMismatch` on the correctAnswerKey control
// itself in addition to returning it at the group level.
export const correctKeyMatchesOptionValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const optionsControl = group.get('options');
  const keyControl = group.get('correctAnswerKey');
  if (!optionsControl || !keyControl) {
    return null;
  }

  const key = keyControl.value;
  if (!key) {
    clearKeyMismatch(keyControl);
    return null;
  }

  const options: unknown[] = (optionsControl as FormArray).controls.map((c) => c.value);
  if (!options.includes(key)) {
    keyControl.setErrors({ ...keyControl.errors, keyMismatch: true });
    return { keyMismatch: true };
  }

  clearKeyMismatch(keyControl);
  return null;
};

function clearKeyMismatch(control: AbstractControl): void {
  if (!control.errors?.['keyMismatch']) {
    return;
  }
  const { keyMismatch: _removed, ...rest } = control.errors;
  control.setErrors(Object.keys(rest).length > 0 ? rest : null);
}
