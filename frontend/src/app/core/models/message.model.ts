export type MessageType = 'contact' | 'signalement';
export type MessageStatus = 'nouveau' | 'lu' | 'traite';

export interface Message {
  id: number;
  user_id: number | null;
  type: MessageType;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: MessageStatus;
  created_at: string;
}

export interface MessagePayload {
  type: MessageType;
  name?: string;
  email?: string;
  phone?: string | null;
  subject: string;
  message: string;
}

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  nouveau: 'Nouveau',
  lu: 'Lu',
  traite: 'Traité',
};