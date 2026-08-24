export type PvCaseStatus = 'DISPATCHED' | 'ASSIGNED' | 'IN_PROGRESS' | 'REPORT_RECEIVED' | 'ADVERSE' | 'CLEARED' | 'OVERDUE';

export interface ClassificationRule {
  condition: string;
  pvType: string;
  passportDispatch: string;
}

export interface DispatchPvCaseRequest {
  arn: string;
  governmentServant: boolean;
  seniorCitizen: boolean;
  courtDirected: boolean;
  addressChangedSinceLastPassport: boolean;
  district: string;
  state: string;
}

export interface PvCaseResponse {
  id: number;
  arn: string;
  pvType: string;
  status: PvCaseStatus;
  district: string;
  state: string;
  dispatchedAt: string;
  slaDeadline: string;
  clearedAt?: string | null;
  remarks?: string | null;
  applicantAction: string;
  updatedAt: string;
}

export interface UpdatePvCaseStatusRequest {
  status: PvCaseStatus;
  remarks?: string | null;
}
