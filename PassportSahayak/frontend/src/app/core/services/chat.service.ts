import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ChatRequest, ChatResponse } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly base = `${environment.apiUrl}/ai/passport`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  sendSync(req: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.base}/chat/sync`, req);
  }

  /**
   * Streams tokens from /chat/async via fetch + ReadableStream (SSE), since Angular's
   * HttpClient doesn't support streaming responses. Emits each raw SSE frame's text.
   */
  streamAsync(req: ChatRequest, onToken: (token: string) => void, onDone: (sessionId: string, citations: unknown[]) => void, onError: (err: unknown) => void): void {
    fetch(`${this.base}/chat/async`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.auth.token}`
      },
      body: JSON.stringify(req)
    })
      .then(async (response) => {
        if (!response.ok || !response.body) {
          throw new Error(`Stream request failed (HTTP ${response.status})`);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';

          for (const evt of events) {
            const lines = evt.split('\n');
            const eventLine = lines.find((l) => l.startsWith('event:'));
            const dataLine = lines.find((l) => l.startsWith('data:'));
            if (!dataLine) continue;
            const eventName = eventLine ? eventLine.replace('event:', '').trim() : 'message';
            const data = JSON.parse(dataLine.replace('data:', '').trim());

            if (eventName === 'token') {
              onToken(data.token as string);
            } else if (eventName === 'done') {
              onDone(data.sessionId as string, (data.citations as unknown[]) ?? []);
            }
          }
        }
      })
      .catch((err) => onError(err));
  }
}
