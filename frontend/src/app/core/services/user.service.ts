import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/user.model';

export interface UserPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string | null;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  create(payload: UserPayload): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, payload);
  }

  update(id: number, payload: Partial<UserPayload>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${id}`, payload);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/users/${id}`);
  }
}