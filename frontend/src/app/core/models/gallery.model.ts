export const GALLERY_CATEGORIES = [
  'Chambres',
  'Restaurant',
  'Bar',
  'Spa',
  'Piscine',
  'Salle de sport',
  'Salle de conférence',
  'Réception',
  'Extérieur / Jardin',
  'Événements',
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export interface Gallery {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string | null;
  is_published: boolean;
  likes_count?: number;
  is_liked?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryPayload {
  title: string;
  category: string;
  image?: File | null;
  description?: string | null;
  is_published?: boolean;
}