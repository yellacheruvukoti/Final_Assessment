// Application route paths, relative to the app root (no leading slash), per
// ui-model.md Section 1. Static routes are plain strings; routes with a
// dynamic segment are functions that build the concrete navigable path.
// This is the single source of truth for navigation — routerLink and
// Router.navigate() call sites must reference these, never a literal path
// string (frontend-constitution.md Section 4.2.2).
export const AppRoutes = {
  login: 'login',
  notFound: '404',
  serviceUnavailable: 'service-unavailable',

  student: {
    root: 'student',
    dashboard: 'student/dashboard',
    courses: 'student/courses',
    courseDetail: (courseId: string): string => `student/courses/${courseId}`,
    courseMaterials: (courseId: string): string => `student/courses/${courseId}/materials`,
    progress: 'student/progress',
    courseQuizzes: (courseId: string): string => `student/courses/${courseId}/quizzes`,
    assessmentQuizzes: (assessmentId: string): string => `student/assessments/${assessmentId}/quizzes`,
    quizAttempt: (quizId: string): string => `student/quizzes/${quizId}/attempt`,
    assessments: 'student/assessments',
    registrations: 'student/registrations',
    certificates: 'student/certificates',
  },

  instructor: {
    root: 'instructor',
    dashboard: 'instructor/dashboard',
    courses: 'instructor/courses',
    courseCreate: 'instructor/courses/new',
    courseEdit: (courseId: string): string => `instructor/courses/${courseId}/edit`,
    moduleManagement: (courseId: string): string => `instructor/courses/${courseId}/modules`,
    contentUpload: (courseId: string): string => `instructor/courses/${courseId}/materials/new`,
    quizManagement: (courseId: string): string => `instructor/courses/${courseId}/quizzes`,
    quizCreate: 'instructor/quizzes/new',
    quizEdit: (quizId: string): string => `instructor/quizzes/${quizId}/edit`,
    assessments: 'instructor/assessments',
    assessmentCreate: 'instructor/assessments/new',
    assessmentEdit: (assessmentId: string): string => `instructor/assessments/${assessmentId}/edit`,
    performance: 'instructor/performance',
    summary: (batchId: string): string => `instructor/summary/${batchId}`,
  },

  admin: {
    root: 'admin',
    dashboard: 'admin/dashboard',
    users: 'admin/users',
    studentCreate: 'admin/users/students/new',
    studentEdit: (userId: string): string => `admin/users/students/${userId}/edit`,
    instructorCreate: 'admin/users/instructors/new',
    instructorEdit: (userId: string): string => `admin/users/instructors/${userId}/edit`,
    batchCreate: 'admin/batches/new',
    certificates: 'admin/certificates',
  },
} as const;
