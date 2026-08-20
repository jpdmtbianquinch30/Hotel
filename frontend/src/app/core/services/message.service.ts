import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message, MessagePayload, MessageStatus } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  constructor(private readonly http: HttpClient) {}

  send(payload: MessagePayload): Observable<Message> {
    return this.http.post<Message>(`${environment.apiUrl}/messages`, payload);
  }

  list(): Observable<Message[]> {
    return this.http.get<Message[]>(`${environment.apiUrl}/messages`);
  }

  updateStatus(id: number, status: MessageStatus): Observable<Message> {
    return this.http.patch<Message>(`${environment.apiUrl}/messages/${id}/status`, { status });
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/messages/${id}`);
  }
}