import { FormControl, FormGroup } from '@angular/forms';

import { endAfterStartValidator } from './end-after-start.validator';

describe('endAfterStartValidator', () => {
  function buildGroup(startTime: string | null, endTime: string | null): FormGroup {
    return new FormGroup(
      { startTime: new FormControl(startTime), endTime: new FormControl(endTime) },
      { validators: endAfterStartValidator },
    );
  }

  it('returns null when end is after start', () => {
    const group = buildGroup('2026-01-01T10:00', '2026-01-01T12:00');
    expect(group.errors).toBeNull();
    expect(group.get('endTime')?.errors).toBeNull();
  });

  it('sets endBeforeStart on the group and the endTime control when end equals start', () => {
    const group = buildGroup('2026-01-01T10:00', '2026-01-01T10:00');
    expect(group.errors).toEqual({ endBeforeStart: true });
    expect(group.get('endTime')?.errors).toEqual({ endBeforeStart: true });
  });

  it('sets endBeforeStart when end is before start', () => {
    const group = buildGroup('2026-01-01T12:00', '2026-01-01T10:00');
    expect(group.errors).toEqual({ endBeforeStart: true });
    expect(group.get('endTime')?.errors).toEqual({ endBeforeStart: true });
  });

  it('returns null when either field is empty', () => {
    expect(buildGroup(null, '2026-01-01T10:00').errors).toBeNull();
    expect(buildGroup('2026-01-01T10:00', null).errors).toBeNull();
  });

  it('clears endBeforeStart once the fields become valid again', () => {
    const group = buildGroup('2026-01-01T12:00', '2026-01-01T10:00');
    expect(group.get('endTime')?.errors).toEqual({ endBeforeStart: true });

    group.get('endTime')?.setValue('2026-01-01T14:00');
    group.updateValueAndValidity();

    expect(group.errors).toBeNull();
    expect(group.get('endTime')?.errors).toBeNull();
  });
});
