export interface BatchResponse {
  batchId: string;
  batchCode: string;
  batchName: string;
  ownerId: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}
