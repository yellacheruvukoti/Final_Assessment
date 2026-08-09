import { Injectable } from '@angular/core';

import { ERROR_MESSAGES } from '../constants/error-codes.constants';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  resolveMessage(code: string | null | undefined, fallback: string): string {
    if (code && code in ERROR_MESSAGES) {
      return ERROR_MESSAGES[code];
    }
    return fallback;
  }
}
