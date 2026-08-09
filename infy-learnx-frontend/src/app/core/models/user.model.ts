import { UserRole } from '../constants/role.constants';

export { UserRole };

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// data-model.md Section 3.0
export interface UserResponse {
  userId: string;
  userCode: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}
