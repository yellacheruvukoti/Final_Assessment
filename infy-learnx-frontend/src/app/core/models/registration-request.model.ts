export interface CreateRegistrationRequest {
  studentId: string;
  assessmentId: string;
  // Optional per the real registration-service DTO; not part of
  // frontend-tasks.md E-02's literal field list.
  sourceChannel?: string;
}
