export enum RegistrationStatus {
  REGISTERED = 'REGISTERED',
  CANCELLED = 'CANCELLED',
}

// data-model.md Section 3.6
export interface RegistrationResponse {
  registrationId: string;
  studentId: string;
  assessmentId: string;
  status: RegistrationStatus;
  registeredAt: string;
  cancelledAt: string | null;
  lastReactivatedAt: string | null;
  sourceChannel: string | null;
  createdAt: string;
  updatedAt: string;
}
