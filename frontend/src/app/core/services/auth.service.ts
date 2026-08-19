import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginPayload,
  PasswordPayload,
  ProfilePayload,
  RegisterPayload,
  User,
} from '../models/user.model';

const TOKEN_KEY = 'hotel_token';
const USER_KEY = 'hotel_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<User | null>(this.readStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

  constructor(private readonly http: HttpClient) {}

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/register`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/login`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  logout(): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${environment.apiUrl}/logout`, {})
      .pipe(tap(() => this.clearSession()));
  }

  /** Nettoyage local immédiat, utilisé même si l'appel /logout échoue (token déjà expiré, réseau, etc.) */
  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
  }

  refreshMe(): Observable<User> {
    return this.http
      .get<User>(`${environment.apiUrl}/me`)
      .pipe(tap((user) => this.persistUser(user)));
  }
    updateProfile(payload: ProfilePayload): Observable<User> {
    const formData = new FormData();
    if (payload.name !== undefined) formData.append('name', payload.name);
    if (payload.email !== undefined) formData.append('email', payload.email);
    if (payload.phone !== undefined && payload.phone !== null) formData.append('phone', payload.phone);
    if (payload.address !== undefined && payload.address !== null) formData.append('address', payload.address);
    if (payload.avatar) formData.append('avatar', payload.avatar);
    if (payload.remove_avatar) formData.append('remove_avatar', '1');
    formData.append('_method', 'PUT');

    return this.http
      .post<User>(`${environment.apiUrl}/me`, formData)
      .pipe(tap((user) => this.persistUser(user)));
  }

  updatePassword(payload: PasswordPayload): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${environment.apiUrl}/me/password`, payload);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    this.persistUser(res.user);
  }

  private persistUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
