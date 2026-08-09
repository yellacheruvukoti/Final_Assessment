import { AccessLevel, MaterialType } from './material.model';
import { CourseStatus } from './course.model';

// Matches the real learning-service CourseCreateRequest DTO. Note this
// differs from frontend-tasks.md E-02's literal description (title,
// description, status): the backend does not accept `status` on create
// (new courses are always DRAFT server-side) and requires `courseCode` +
// `instructorId`, neither of which the frontend spec mentions collecting.
export interface CreateCourseRequest {
  courseCode: string;
  title: string;
  description: string | null;
  instructorId: string;
}

// Matches the real CourseUpdateRequest DTO exactly.
export interface UpdateCourseRequest {
  title: string;
  description: string | null;
  status: CourseStatus;
}

export interface CreateModuleRequest {
  title: string;
  moduleOrder: number;
}

export interface CreateMaterialRequest {
  title: string;
  materialType: MaterialType;
  resourcePath: string;
  accessLevel: AccessLevel;
  moduleId: string;
}
