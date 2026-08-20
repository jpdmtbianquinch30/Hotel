import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AdminNotificationSummary, LatestNotifications, NotificationCategory } from '../models/notification.model';

const STORAGE_PREFIX = 'galsenhotel_lastseen_';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);

  private readonly latest = signal<LatestNotifications>({ rooms: null, gallery: null, rules: null });
  private readonly lastSeen = signal<Record<NotificationCategory, string | null>>({
    rooms: this.readStored('rooms'),
    gallery: this.readStored('gallery'),
    rules: this.readStored('rules'),
  });

  readonly hasNewRooms = computed(() => this.isNewer('rooms'));
  readonly hasNewGallery = computed(() => this.isNewer('gallery'));
  readonly hasNewRules = computed(() => this.isNewer('rules'));

  // --- Côté admin ---
  private readonly adminSummary = signal<AdminNotificationSummary>({ unread_messages: 0, unread_reports: 0 });
  readonly adminUnreadTotal = computed(
    () => this.adminSummary().unread_messages + this.adminSummary().unread_reports
  );

  refresh(): void {
    this.http.get<LatestNotifications>(`${environment.apiUrl}/notifications/latest`).subscribe({
      next: (res) => this.latest.set(res),
      error: () => {},
    });
  }

  refreshAdminSummary(): void {
    this.http.get<AdminNotificationSummary>(`${environment.apiUrl}/notifications/admin-summary`).subscribe({
      next: (res) => this.adminSummary.set(res),
      error: () => {},
    });
  }

  /** Appelé quand l'utilisateur visite la page correspondante : éteint le badge. */
  markSeen(category: NotificationCategory): void {
    const now = new Date().toISOString();
    this.lastSeen.update((state) => ({ ...state, [category]: now }));
    localStorage.setItem(STORAGE_PREFIX + category, now);
  }

  private isNewer(category: NotificationCategory): boolean {
    const latestDate = this.latest()[category];
    if (!latestDate) return false;

    const seen = this.lastSeen()[category];
    if (!seen) return true;

    return new Date(latestDate).getTime() > new Date(seen).getTime();
  }

  private readStored(category: NotificationCategory): string | null {
    return localStorage.getItem(STORAGE_PREFIX + category);
  }
}