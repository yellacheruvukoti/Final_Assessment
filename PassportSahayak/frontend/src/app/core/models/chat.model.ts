export interface ChatRequest {
  sessionId?: string | null;
  query: string;
  arn?: string | null;
}

export interface Citation {
  docCode: string;
  title: string;
  chunkIndex: number;
  similarity: number;
}

export interface ChatResponse {
  sessionId: string;
  answer: string;
  escalated: boolean;
  citations: Citation[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  escalated?: boolean;
  citations?: Citation[];
  pending?: boolean;
}
