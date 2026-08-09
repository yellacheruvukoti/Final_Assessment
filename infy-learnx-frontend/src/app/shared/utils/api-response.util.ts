import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { ApiError, ApiResponse, PagedResult } from '../../core/models/api-response.model';

// Shared by every API service (F-02/F-03) so the envelope-unwrapping and
// error-rethrowing rules from frontend-constitution.md Section 10.5 are
// implemented once, not copy-pasted into a dozen services.

export function unwrapEnvelope<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    throw response.error;
  }
  return response.data;
}

// KNOWN BACKEND GAP: pagination (api-contract.md Section 18) is
// unimplemented across the entire backend — every list endpoint returns
// `meta: null`. Rather than fabricate page/size/totalPages values, this
// derives them mechanically from the array actually returned (single page
// containing everything), so PagedResult<T>'s non-nullable `meta` field is
// satisfiable without inventing anything not present in the real response.
// Replace this fallback once the backend implements real pagination.
export function unwrapPagedEnvelope<T>(response: ApiResponse<T[]>): PagedResult<T> {
  const data = unwrapEnvelope(response);
  return {
    data,
    meta: response.meta ?? {
      page: 0,
      size: data.length,
      totalElements: data.length,
      totalPages: data.length > 0 ? 1 : 0,
    },
  };
}

export function rethrowApiError(error: HttpErrorResponse): Observable<never> {
  const apiError: ApiError | undefined = error.error?.error;
  return throwError(() => apiError ?? error);
}
