import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Room, RoomPayload } from '../models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly base = `${environment.apiUrl}/rooms`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Room[]> {
    return this.http.get<Room[]>(this.base);
  }

  get(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.base}/${id}`);
  }

  create(payload: RoomPayload): Observable<Room> {
    return this.http.post<Room>(this.base, payload);
  }

  update(id: number, payload: Partial<RoomPayload>): Observable<Room> {
    return this.http.put<Room>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
