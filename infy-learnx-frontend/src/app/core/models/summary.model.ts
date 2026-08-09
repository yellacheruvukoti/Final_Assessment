// Registration summary responses (data-model.md Section 3.7, derived view).
// Shapes mirror the actual summary-service DTOs: the batch overview and
// status-wise endpoints share one shape; the by-assessment endpoint nests a
// per-assessment breakdown.
export interface RegistrationSummaryResponse {
  batchId: string;
  totalRegistered: number;
  totalCancelled: number;
  generatedAt: string;
}

export interface AssessmentSummaryItem {
  assessmentId: string;
  totalRegistered: number;
  totalCancelled: number;
}

export interface AssessmentWiseSummaryResponse {
  batchId: string;
  generatedAt: string;
  assessments: AssessmentSummaryItem[];
}
