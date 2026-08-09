import { FormGroup } from '@angular/forms';

// frontend-tasks.md L-02: maps a 400/422 response's `error.details` onto
// matching form controls; anything that doesn't match a control name is
// returned so the caller can show it in a form-level banner (M-02).
//
// Real shape (see ApiError's doc comment): a flat string array of
// "fieldName: message" entries, not a field-name -> message map as
// api-contract.md implies. Each entry is split on its first ':' to
// recover the field name and message; entries with no ':', or whose field
// name doesn't match a control on this form, are treated as unmatched.
//
// Errors set here clear themselves automatically the next time the
// control's value changes — standard Angular behavior, since a value
// change re-runs the control's own validators and replaces whatever was
// set via setErrors().
export function applyServerErrors(form: FormGroup, details: string[] | null): string[] {
  const unmatched: string[] = [];
  if (!details) {
    return unmatched;
  }

  for (const detail of details) {
    const separatorIndex = detail.indexOf(':');
    const fieldName = separatorIndex === -1 ? null : detail.slice(0, separatorIndex).trim();
    const control = fieldName ? form.get(fieldName) : null;

    if (!control) {
      unmatched.push(detail);
      continue;
    }

    const message = detail.slice(separatorIndex + 1).trim();
    control.setErrors({ serverError: message });
    control.markAsTouched();
  }

  return unmatched;
}
