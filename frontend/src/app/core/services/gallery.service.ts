import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Gallery, GalleryPayload } from '../models/gallery.model';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private readonly base = `${environment.apiUrl}/gallery`;

  constructor(private readonly http: HttpClient) {}

  /** Liste publique : images publiées uniquement, filtrable par catégorie. */
  list(category?: string): Observable<Gallery[]> {
    const url = category ? `${this.base}?category=${encodeURIComponent(category)}` : this.base;
    return this.http.get<Gallery[]>(url);
  }

  /** Liste admin : toutes les images (publiées ou non). */
  listAll(): Observable<Gallery[]> {
    return this.http.get<Gallery[]>(`${environment.apiUrl}/gallery-admin`);
  }

  create(payload: GalleryPayload): Observable<Gallery> {
    return this.http.post<Gallery>(this.base, this.toFormData(payload));
  }

  update(id: number, payload: Partial<GalleryPayload>): Observable<Gallery> {
    const formData = this.toFormData(payload);
    formData.append('_method', 'PUT');
    return this.http.post<Gallery>(`${this.base}/${id}`, formData);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  private toFormData(payload: Partial<GalleryPayload>): FormData {
    const formData = new FormData();
    if (payload.title !== undefined) formData.append('title', payload.title);
    if (payload.category !== undefined) formData.append('category', payload.category);
    if (payload.description) formData.append('description', payload.description);
    if (payload.is_published !== undefined) {
      formData.append('is_published', payload.is_published ? '1' : '0');
    }
    if (payload.image) formData.append('image', payload.image);
    return formData;
  }
    toggleLike(id: number): Observable<{ liked: boolean; likes_count: number }> {
    return this.http.post<{ liked: boolean; likes_count: number }>(`${this.base}/${id}/like`, {});
  }
}