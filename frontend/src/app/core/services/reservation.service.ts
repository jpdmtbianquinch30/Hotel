import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Reservation,
  ReservationPayload,
  ReservationStatus,
} from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly base = `${environment.apiUrl}/reservations`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.base);
  }

  get(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.base}/${id}`);
  }

  create(payload: ReservationPayload): Observable<Reservation> {
    return this.http.post<Reservation>(this.base, payload);
  }

  updateStatus(id: number, status: ReservationStatus): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.base}/${id}/status`, { status });
  }

  cancel(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
}
