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
    return this.http.post<Room>(this.base, this.toFormData(payload));
  }

  update(id: number, payload: Partial<RoomPayload>): Observable<Room> {
    // Laravel ne lit pas les fichiers sur une vraie requête PUT multipart :
    // on envoie en POST avec un champ _method=PUT (method spoofing).
    const formData = this.toFormData(payload);
    formData.append('_method', 'PUT');
    return this.http.post<Room>(`${this.base}/${id}`, formData);
  }

  private toFormData(payload: Partial<RoomPayload>): FormData {
    const formData = new FormData();
    if (payload.room_type !== undefined) formData.append('room_type', payload.room_type);
    if (payload.price !== undefined) formData.append('price', String(payload.price));
    if (payload.description) formData.append('description', payload.description);
    if (payload.is_available !== undefined) {
      formData.append('is_available', payload.is_available ? '1' : '0');
    }
    if (payload.photo) formData.append('photo', payload.photo);
    if (payload.remove_photo) formData.append('remove_photo', '1');
    return formData;
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }
    toggleLike(id: number): Observable<{ liked: boolean; likes_count: number }> {
    return this.http.post<{ liked: boolean; likes_count: number }>(`${this.base}/${id}/like`, {});
  }
}