export enum InstructorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// data-model.md Section 3.2
export interface InstructorResponse {
  instructorId: string;
  userId: string;
  instructorCode: string;
  specialization: string | null;
  status: InstructorStatus;
  createdAt: string;
  updatedAt: string;
}
