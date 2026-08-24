export type KbDocumentStatus = 'ACTIVE' | 'SUPERSEDED';

export interface IngestMetadata {
  docCode?: string | null;
  version: string;
  audience?: string | null;
  effectiveDate?: string | null;
  tags?: string | null;
}

export interface IngestDocumentResponse {
  documentId: string;
  chunks_created: number;
  ingestion_time_ms: number;
  metadata: IngestMetadata;
}

export interface KbDocumentResponse {
  documentId: string;
  docCode?: string | null;
  title: string;
  version: string;
  audience?: string | null;
  effectiveDate?: string | null;
  tags?: string | null;
  originalFilename: string;
  status: KbDocumentStatus;
  chunkCount: number;
  ingestionTimeMs: number;
  createdAt: string;
}

export interface KbChunkResponse {
  id: number;
  chunkIndex: number;
  content: string;
  embeddingStatus: 'PENDING' | 'EMBEDDED' | 'FAILED';
}
