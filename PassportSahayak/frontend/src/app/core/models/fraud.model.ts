export type FraudCategory =
  | 'DOCUMENT_FORGERY' | 'IDENTITY_IMPERSONATION' | 'SUPPRESSION_OF_INFO' | 'AGENT_BROKER_FRAUD'
  | 'DUPLICATE_PASSPORT' | 'ONLINE_PHISHING' | 'INTERNAL_MISCONDUCT' | 'PV_CORRUPTION';

export type FraudReportStatus = 'REPORTED' | 'UNDER_REVIEW' | 'REFERRED' | 'CLOSED';

export interface FileFraudReportRequest {
  arn?: string | null;
  category: FraudCategory;
  description: string;
}

export interface FraudReportResponse {
  id: number;
  arn?: string | null;
  category: FraudCategory;
  severity: string;
  referralAuthority: string;
  description: string;
  status: FraudReportStatus;
  createdAt: string;
}

export interface UpdateFraudReportStatusRequest {
  status: FraudReportStatus;
}

export interface ReferralMatrixEntry {
  category: string;
  severity: string;
  referralAuthority: string;
  outcome: string;
}

export type EscalationType = 'DISPUTED_PARENTAGE' | 'REPEATED_LOST_PASSPORT' | 'DENIED_NOC';
export type EscalationStatus = 'OPEN' | 'ON_HOLD' | 'RESOLVED';

export interface CreateEscalationRequest {
  arn: string;
  type: EscalationType;
  details: string;
}

export interface EscalationCaseResponse {
  id: number;
  arn: string;
  type: EscalationType;
  details: string;
  status: EscalationStatus;
  createdAt: string;
}
