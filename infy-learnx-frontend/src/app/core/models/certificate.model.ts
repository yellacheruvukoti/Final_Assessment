export enum CertificateStatus {
  ISSUED = 'ISSUED',
  REVOKED = 'REVOKED',
}

// data-model.md Section 3.20. downloadToken is deliberately never exposed
// here — the backend's CertificateResponse withholds it; it is only
// revealed via the dedicated download endpoint to the owning student.
export interface CertificateResponse {
  certificateId: string;
  studentId: string;
  assessmentId: string;
  courseId: string | null;
  score: number;
  status: CertificateStatus;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Real backend shape verified live against GET
// /api/certificates/{id}/download: a JSON envelope carrying a
// downloadToken, NOT a binary file stream. frontend-tasks.md F-02 assumes
// `responseType: 'blob'` and "file delivered" — that doesn't match this
// backend, which has no endpoint that actually serves certificate binary
// content from this token. Modeled to match what the endpoint really
// returns; the "deliver an actual file" UX is a gap for whenever I-03
// wires this up.
export interface CertificateDownloadResponse {
  certificateId: string;
  studentId: string;
  assessmentId: string;
  courseId: string | null;
  score: number;
  issuedAt: string;
  downloadToken: string;
}
