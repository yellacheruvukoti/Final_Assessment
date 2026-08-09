// Matches the real certification-service CertificateIssueRequest DTO
// exactly (studentId, assessmentId, score — score required, 0-100, >= 60
// enforced server-side). DESIGN DECISION: no entity anywhere in the
// backend computes a per-student assessment score (see the design note on
// the backend's CertificateIssueRequest.java) — evaluation happens outside
// this system's modeled boundary. Certificate issuance is therefore an
// INSTRUCTOR action, not student self-service: the instructor enters the
// score (from whatever external evaluation they have) at issuance time.
// This changes the "Request Certificate" flow described in
// frontend-tasks.md I-03/K-03 from a student-facing button to an
// instructor-facing form when that page is built.
export interface IssueCertificateRequest {
  studentId: string;
  assessmentId: string;
  score: number;
}
