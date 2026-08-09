export enum MaterialType {
  PDF = 'PDF',
  VIDEO = 'VIDEO',
  LINK = 'LINK',
  DOC = 'DOC',
}

export enum AccessLevel {
  ENROLLED_ONLY = 'ENROLLED_ONLY',
  PUBLIC_READ = 'PUBLIC_READ',
}

export type MaterialStatus = 'ACTIVE' | 'INACTIVE';

// data-model.md Section 3.10
export interface LearningMaterialResponse {
  materialId: string;
  moduleId: string;
  title: string;
  materialType: MaterialType;
  resourcePath: string;
  accessLevel: AccessLevel;
  status: MaterialStatus;
  createdAt: string;
  updatedAt: string;
}
