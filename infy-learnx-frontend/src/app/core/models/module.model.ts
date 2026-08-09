export type ModuleStatus = 'ACTIVE' | 'INACTIVE';

// data-model.md Section 3.9
export interface CourseModuleResponse {
  moduleId: string;
  courseId: string;
  title: string;
  moduleOrder: number;
  status: ModuleStatus;
  createdAt: string;
  updatedAt: string;
}
