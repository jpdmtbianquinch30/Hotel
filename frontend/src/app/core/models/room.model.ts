export interface Room {
  id: number;
  room_type: string;
  price: string;
  photo: string | null;
  description: string | null;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RoomPayload {
  room_type: string;
  price: number;
  photo?: string | null;
  description?: string | null;
  is_available?: boolean;
}
