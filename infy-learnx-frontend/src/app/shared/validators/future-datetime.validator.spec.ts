import { FormControl } from '@angular/forms';

import { futureDatetimeValidator } from './future-datetime.validator';

describe('futureDatetimeValidator', () => {
  it('returns null when empty', () => {
    expect(futureDatetimeValidator(new FormControl(''))).toBeNull();
    expect(futureDatetimeValidator(new FormControl(null))).toBeNull();
  });

  it('returns an error for a past datetime', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(futureDatetimeValidator(new FormControl(past))).toEqual({ pastDatetime: true });
  });

  it('returns null for a future datetime', () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    expect(futureDatetimeValidator(new FormControl(future))).toBeNull();
  });
});
