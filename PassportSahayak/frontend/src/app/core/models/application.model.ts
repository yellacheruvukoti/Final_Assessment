export type ApplicationType = 'FRESH' | 'REISSUE_RENEWAL' | 'REISSUE_LOST_DAMAGED' | 'REISSUE_NAME_CHANGE';
export type ServiceScheme = 'NORMAL' | 'TATKAL';
export type BookletType = 'STANDARD_36' | 'JUMBO_60';
export type PvType = 'PRE_PV' | 'POST_PV' | 'PV_EXEMPT' | 'EXPEDITED_PRE_PV';
export type ExistingPassportStatus = 'NONE' | 'VALID' | 'EXPIRED' | 'LOST' | 'DAMAGED';
export type TatkalReason =
  | 'MEDICAL_EMERGENCY' | 'DEATH_OF_RELATIVE_ABROAD' | 'EMPLOYMENT_VISA'
  | 'EDUCATION_VISA' | 'COURT_LEGAL_SUMMONS' | 'PASSPORT_EXPIRY_WITH_TRAVEL' | 'SPORTS_CULTURAL_EVENT';

export type ApplicationStatus =
  | 'SUBMITTED' | 'APPOINTMENT_BOOKED' | 'PSK_VISIT_COMPLETED' | 'PV_DISPATCHED'
  | 'PV_IN_PROGRESS' | 'PV_CLEARED' | 'PASSPORT_DISPATCHED' | 'PASSPORT_DELIVERED'
  | 'ON_HOLD' | 'REJECTED' | 'CANCELLED';

export interface EligibilityCheckRequest {
  dateOfBirth: string;
  existingPassportStatus: ExistingPassportStatus;
  existingPassportIssueDate?: string | null;
  existingPassportExpiryDate?: string | null;
  addressChangedSinceLastPassport: boolean;
  pagesExhausted: boolean;
  tatkalReason?: TatkalReason | null;
  travelWithinDays?: number | null;
}

export interface EligibilityCheckResponse {
  minor: boolean;
  eligibleApplicationTypes: ApplicationType[];
  recommendedApplicationType: ApplicationType;
  validityYears: number;
  allowedBookletTypes: BookletType[];
  tatkalEligible: boolean;
  tatkalNote: string;
  recommendedPvType: PvType;
  ecrEcnrGuidance: string;
  notes: string;
}

export interface DocumentChecklistItem {
  document: string;
  mandatory: boolean;
  note?: string | null;
}

export interface AnnexureInfo {
  code: string;
  title: string;
  whenRequired: string;
}

export interface DocumentChecklistResponse {
  applicationType: ApplicationType;
  minor: boolean;
  documents: DocumentChecklistItem[];
  applicableAnnexures: AnnexureInfo[];
}

export interface FeeEstimateResponse {
  feeAmount: number;
  breakdown: string;
}

export interface CreateApplicationRequest {
  applicationType: ApplicationType;
  serviceScheme: ServiceScheme;
  bookletType: BookletType;
  dateOfBirth: string;
  tatkalReason?: TatkalReason | null;
}

export interface ApplicationResponse {
  id: number;
  arn: string;
  applicantUserId: number;
  applicationType: ApplicationType;
  serviceScheme: ServiceScheme;
  bookletType: BookletType;
  minor: boolean;
  status: ApplicationStatus;
  pvType?: PvType | null;
  feeAmount: number;
  feePaid: boolean;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStatusResponse {
  arn: string;
  status: ApplicationStatus;
  pvType?: PvType | null;
  applicantNextStep: string;
  updatedAt: string;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
  pvType?: PvType | null;
  remarks?: string | null;
}
