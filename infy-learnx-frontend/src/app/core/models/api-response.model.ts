// Standard API response envelope shared by every backend endpoint
// (api-contract.md Section 1 / Section 18).
//
// `details`: api-contract.md implies a field-name -> message map, but the
// real backend returns a flat string array of "fieldName: message" entries
// (verified live against POST /api/courses validation errors, e.g.
// `["instructorId: must not be null", "title: size must be between 3 and
// 150", ...]`) — confirmed consistent with the pre-existing
// login.service.spec.ts fixture, which already used this array shape.
// applyServerErrors (shared/utils/apply-server-errors.util.ts) parses this
// real format.
export interface ApiError {
  code: string;
  message: string;
  details: string[] | null;
  correlationId: string | null;
}

export interface PaginationMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: ApiError | null;
  meta: PaginationMeta | null;
  timestamp: string;
}

export interface PagedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
