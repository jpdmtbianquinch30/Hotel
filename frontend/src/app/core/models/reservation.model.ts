import { Room } from './room.model';
import { User } from './user.model';

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

export interface Guest {
  id: number;
  firstname: string;
  middlename: string | null;
  lastname: string;
  address: string | null;
  contact_no: string | null;
}

export interface Reservation {
  id: number;
  user_id: number;
  guest_id: number;
  room_id: number;
  room_no: string | null;
  extra_bed: boolean;
  status: ReservationStatus;
  days: number;
  checkin: string;
  checkin_time: string | null;
  checkout: string;
  checkout_time: string | null;
  bill: string;
  guest?: Guest;
  room?: Room;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export interface ReservationPayload {
  room_id: number;
  firstname: string;
  middlename?: string;
  lastname: string;
  address?: string;
  contact_no?: string;
  extra_bed?: boolean;
  days: number;
  checkin: string;
  checkout: string;
}

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  checked_in: 'Arrivé',
  checked_out: 'Parti',
  cancelled: 'Annulée',
};
