import { UserStatus } from './user.model';
import { InstructorStatus } from './instructor.model';

// Matches the real user-service StudentCreateRequest/StudentUpdateRequest DTOs.
export interface CreateStudentRequest {
  fullName: string;
  email: string;
  batchId: string | null;
}

export interface UpdateStudentRequest {
  fullName?: string;
  email?: string;
  batchId?: string | null;
  status?: UserStatus;
}

// Matches the real user-service InstructorCreateRequest/InstructorUpdateRequest DTOs.
export interface CreateInstructorRequest {
  fullName: string;
  email: string;
  specialization: string | null;
}

export interface UpdateInstructorRequest {
  fullName?: string;
  email?: string;
  specialization?: string | null;
  status?: InstructorStatus;
}
