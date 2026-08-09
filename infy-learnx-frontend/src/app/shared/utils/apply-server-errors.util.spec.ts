import { FormControl, FormGroup } from '@angular/forms';

import { applyServerErrors } from './apply-server-errors.util';

describe('applyServerErrors', () => {
  function buildForm(): FormGroup {
    return new FormGroup({
      title: new FormControl(''),
      email: new FormControl(''),
    });
  }

  it('sets serverError on matched controls and marks them touched', () => {
    const form = buildForm();
    applyServerErrors(form, ['title: Title already in use.', 'email: Email is invalid.']);

    expect(form.get('title')?.errors).toEqual({ serverError: 'Title already in use.' });
    expect(form.get('title')?.touched).toBe(true);
    expect(form.get('email')?.errors).toEqual({ serverError: 'Email is invalid.' });
    expect(form.get('email')?.touched).toBe(true);
  });

  it('returns unmatched field names as messages', () => {
    const form = buildForm();
    const unmatched = applyServerErrors(form, [
      'title: Title already in use.',
      'nonExistentField: Something else went wrong.',
    ]);

    expect(unmatched).toEqual(['nonExistentField: Something else went wrong.']);
  });

  it('returns entries with no field-name separator as unmatched', () => {
    const form = buildForm();
    const unmatched = applyServerErrors(form, ['A general failure with no field name']);

    expect(unmatched).toEqual(['A general failure with no field name']);
  });

  it('returns an empty array when details is null', () => {
    const form = buildForm();
    expect(applyServerErrors(form, null)).toEqual([]);
  });

  it('clears serverError once the control value changes', () => {
    const form = buildForm();
    applyServerErrors(form, ['title: Title already in use.']);
    expect(form.get('title')?.errors).toEqual({ serverError: 'Title already in use.' });

    form.get('title')?.setValue('A new title');

    expect(form.get('title')?.errors).toBeNull();
  });
});
