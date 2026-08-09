import { TestBed } from '@angular/core/testing';

import { ERROR_MESSAGES } from '../constants/error-codes.constants';
import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ErrorService] });
    service = TestBed.inject(ErrorService);
  });

  it('returns the exact mapped message for every known error code', () => {
    for (const [code, message] of Object.entries(ERROR_MESSAGES)) {
      expect(service.resolveMessage(code, 'fallback')).toBe(message);
    }
  });

  it('returns the fallback for an unknown code', () => {
    expect(service.resolveMessage('SOME_UNKNOWN_CODE', 'Default message.')).toBe('Default message.');
  });

  it('returns the fallback for a null or undefined code', () => {
    expect(service.resolveMessage(null, 'Default message.')).toBe('Default message.');
    expect(service.resolveMessage(undefined, 'Default message.')).toBe('Default message.');
  });
});
