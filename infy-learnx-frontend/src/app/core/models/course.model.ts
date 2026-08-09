export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

// data-model.md Section 3.8
export interface CourseResponse {
  courseId: string;
  courseCode: string;
  title: string;
  description: string | null;
  status: CourseStatus;
  instructorId: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
