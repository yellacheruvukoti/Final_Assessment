export type EnrollmentStatus = 'ACTIVE' | 'INACTIVE';

// data-model.md Section 3.14
export interface CourseEnrollmentResponse {
  enrollmentId: string;
  courseId: string;
  studentId: string;
  enrollmentStatus: EnrollmentStatus;
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;
}
