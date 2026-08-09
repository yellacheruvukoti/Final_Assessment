import { HttpParams } from '@angular/common/http';

// Builds HttpParams from a plain params object, skipping undefined values.
// Shared across every API service (F-02/F-03) that sends query params.
// Parameter is typed `object` rather than `Record<string, ...>` because
// named interfaces without an explicit index signature (e.g.
// CourseListParams) aren't structurally assignable to Record<string, X>
// when passed as a typed variable — only object literals get that
// leniency. The internal cast is safe: every value is still checked at
// runtime before use.
export function toHttpParams(params: object): HttpParams {
  let httpParams = new HttpParams();
  for (const [key, value] of Object.entries(params as Record<string, string | number | undefined>)) {
    if (value !== undefined) {
      httpParams = httpParams.set(key, value);
    }
  }
  return httpParams;
}
