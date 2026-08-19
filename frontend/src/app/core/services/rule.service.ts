import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Rule, RulePayload } from '../models/rule.model';

@Injectable({ providedIn: 'root' })
export class RuleService {
  private readonly base = `${environment.apiUrl}/rules`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Rule[]> {
    return this.http.get<Rule[]>(this.base);
  }

  create(payload: RulePayload): Observable<Rule> {
    return this.http.post<Rule>(this.base, payload);
  }

  update(id: number, payload: Partial<RulePayload>): Observable<Rule> {
    return this.http.put<Rule>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  reorder(ids: number[]): Observable<Rule[]> {
    return this.http.post<Rule[]>(`${this.base}/reorder`, { ids });
  }
}