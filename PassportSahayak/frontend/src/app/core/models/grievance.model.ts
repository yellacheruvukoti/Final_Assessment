export type GrievanceType =
  | 'STATUS_DELAY' | 'PV_DELAY' | 'INCORRECT_REJECTION' | 'PASSPORT_NOT_RECEIVED'
  | 'STAFF_MISCONDUCT' | 'POLICE_PAYMENT_DEMAND' | 'DATA_ENTRY_ERROR';

export type GrievanceStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';

export interface FileGrievanceRequest {
  arn?: string | null;
  type: GrievanceType;
  description: string;
}

export interface GrievanceResponse {
  id: number;
  arn?: string | null;
  type: GrievanceType;
  status: GrievanceStatus;
  slaWorkingDays: number;
  description: string;
  resolutionNotes?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface UpdateGrievanceStatusRequest {
  status: GrievanceStatus;
  resolutionNotes?: string | null;
}

export interface SlaMatrixEntry {
  grievanceType: string;
  primaryChannel: string;
  slaWorkingDays: number;
  escalation: string;
}

export type AppealLevel = 'LEVEL_1_DPO' | 'LEVEL_2_PASSPORT_OFFICER' | 'LEVEL_3_RPO_HEAD' | 'LEVEL_4_JOINT_SECRETARY';
export type AppealStatus = 'PENDING' | 'DECIDED' | 'ESCALATED';

export interface FileAppealRequest {
  arn: string;
  groundText: string;
}

export interface AppealResponse {
  id: number;
  arn: string;
  level: AppealLevel;
  status: AppealStatus;
  groundText: string;
  decisionNotes?: string | null;
  decidedAt?: string | null;
  createdAt: string;
}

export interface AppealDecisionRequest {
  status: AppealStatus;
  decisionNotes?: string | null;
}

export interface AppealAuthorityInfo {
  level: string;
  authority: string;
  grounds: string;
  timeline: string;
}
