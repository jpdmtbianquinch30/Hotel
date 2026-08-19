export interface Rule {
  id: number;
  title: string;
  content: string;
  position: number;
  created_at?: string;
  updated_at?: string;
}

export interface RulePayload {
  title: string;
  content: string;
}