import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MyLikes } from '../models/like.model';

@Injectable({ providedIn: 'root' })
export class LikeService {
  constructor(private readonly http: HttpClient) {}

  myLikes(): Observable<MyLikes> {
    return this.http.get<MyLikes>(`${environment.apiUrl}/me/likes`);
  }
}