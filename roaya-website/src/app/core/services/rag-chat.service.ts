import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface RagChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface RagChatSource {
  id: string;
  title: string;
  url: string;
  score: number;
}

export interface RagChatAnswer {
  answer: string;
  inScope: boolean;
  sources: RagChatSource[];
  retrievalMode: 'openai-vector' | 'local-hybrid';
}

interface RagApiResponse {
  success: boolean;
  data: RagChatAnswer;
}

@Injectable({ providedIn: 'root' })
export class RagChatService {
  private readonly http = inject(HttpClient);

  ask(question: string, language: 'ar' | 'en', history: RagChatHistoryItem[]): Observable<RagChatAnswer> {
    return this.http.post<RagApiResponse>(`${environment.apiUrl}/rag/chat`, {
      question,
      language,
      history: history.slice(-8),
    }).pipe(map((response) => response.data));
  }
}
