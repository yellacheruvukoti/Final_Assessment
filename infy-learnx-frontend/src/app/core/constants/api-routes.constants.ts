// Backend API endpoint paths, relative to environment.apiBaseUrl (which
// already includes the gateway's `/api` prefix). This is the single source
// of truth for every HTTP call — API service files must reference these,
// never a raw `/api/...` string literal (frontend-constitution.md Section
// 10.1). Static endpoints are plain strings; endpoints with path parameters
// are functions that build the concrete relative path.
export const ApiRoutes = {
  auth: {
    login: 'auth/login',
  },

  users: {
    list: 'users',
    byId: (userId: string): string => `users/${userId}`,
    role: (userId: string): string => `users/${userId}/role`,
    status: (userId: string): string => `users/${userId}/status`,
  },

  students: {
    create: 'students',
    byId: (studentId: string): string => `students/${studentId}`,
    update: (studentId: string): string => `students/${studentId}`,
    deactivate: (studentId: string): string => `students/${studentId}`,
    // Resolves the login-identity userId to the learning/registration-domain
    // studentId (a distinct ID space — verified live against the running
    // backend). Despite `StudentController`'s Javadoc calling this
    // "internal contract (not gateway-routed)", it IS reachable through the
    // gateway; confirmed live with a 200 response.
    byUser: (userId: string): string => `students/by-user/${userId}`,
    registrations: (studentId: string): string => `students/${studentId}/registrations`,
    certificates: (studentId: string): string => `students/${studentId}/certificates`,
  },

  instructors: {
    create: 'instructors',
    byId: (instructorId: string): string => `instructors/${instructorId}`,
    update: (instructorId: string): string => `instructors/${instructorId}`,
    deactivate: (instructorId: string): string => `instructors/${instructorId}`,
    // Same userId -> domain-profile-id resolution as students.byUser, for
    // the INSTRUCTOR role.
    byUser: (userId: string): string => `instructors/by-user/${userId}`,
    performance: (instructorId: string): string => `instructors/${instructorId}/performance`,
  },

  administrators: {
    byId: (administratorId: string): string => `administrators/${administratorId}`,
  },

  batches: {
    list: 'batches',
  },

  courses: {
    list: 'courses',
    create: 'courses',
    byId: (courseId: string): string => `courses/${courseId}`,
    materials: (courseId: string): string => `courses/${courseId}/materials`,
    modules: (courseId: string): string => `courses/${courseId}/modules`,
    quizzes: (courseId: string): string => `courses/${courseId}/quizzes`,
    progress: (courseId: string, studentId: string): string =>
      `courses/${courseId}/progress/${studentId}`,
    enrollments: (courseId: string): string => `courses/${courseId}/enrollments`,
    enrollmentsForStudent: (studentId: string): string => `courses/enrollments/student/${studentId}`,
  },

  quizzes: {
    create: 'quizzes',
    byId: (quizId: string): string => `quizzes/${quizId}`,
    questions: (quizId: string): string => `quizzes/${quizId}/questions`,
  },

  assessments: {
    list: 'assessments',
    create: 'assessments',
    byId: (assessmentId: string): string => `assessments/${assessmentId}`,
    upcoming: 'assessments/upcoming',
  },

  registrations: {
    create: 'registrations',
    cancel: (registrationId: string): string => `registrations/${registrationId}/cancel`,
    reregister: (registrationId: string): string => `registrations/${registrationId}/reregister`,
  },

  summaries: {
    batch: (batchId: string): string => `summaries/batches/${batchId}`,
    byAssessment: (batchId: string): string => `summaries/batches/${batchId}/assessments`,
    byStatus: (batchId: string): string => `summaries/batches/${batchId}/status`,
  },

  certificates: {
    list: 'certificates',
    create: 'certificates',
    byId: (certificateId: string): string => `certificates/${certificateId}`,
    download: (certificateId: string): string => `certificates/${certificateId}/download`,
    revoke: (certificateId: string): string => `certificates/${certificateId}/revoke`,
  },
} as const;
