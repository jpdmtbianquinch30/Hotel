export type NotificationCategory = 'rooms' | 'gallery' | 'rules';

export interface LatestNotifications {
  rooms: string | null;
  gallery: string | null;
  rules: string | null;
}

export interface AdminNotificationSummary {
  unread_messages: number;
  unread_reports: number;
}