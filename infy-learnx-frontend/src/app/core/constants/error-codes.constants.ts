// Error code -> user-facing message mapping, per frontend-api-mapping.md
// Section 1.5. ErrorService.resolveMessage() is the only consumer; unknown
// codes fall back to the caller-supplied default (never blank/undefined).
export const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  DUPLICATE_REGISTRATION: 'You are already registered for this assessment.',
  ASSESSMENT_NOT_UPCOMING: 'Registration is not allowed for this assessment.',
  ASSESSMENT_ALREADY_STARTED: 'This assessment has already started. Registration is closed.',
  COURSE_NOT_ENROLLED: 'You must be enrolled in this course to access learning materials.',
  COURSE_ACCESS_DENIED: 'You do not have access to this course.',
  CERTIFICATE_ALREADY_ISSUED: 'A certificate has already been issued for this assessment.',
  SCORE_BELOW_THRESHOLD: 'Minimum passing score not met for certificate issuance.',
  CERTIFICATE_NOT_FOUND: 'Certificate not found.',
  SUMMARY_ACCESS_DENIED: 'You are not authorized to view this summary.',
  REGISTRATION_CANCELLED: 'This registration is already cancelled.',
  DEPENDENCY_UNAVAILABLE: 'This feature is temporarily unavailable. Please try again shortly.',
  VALIDATION_ERROR: 'Please correct the highlighted errors and try again.',
};
