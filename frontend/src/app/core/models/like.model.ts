import { Gallery } from './gallery.model';
import { Room } from './room.model';

export interface MyLikes {
  rooms: Room[];
  gallery: Gallery[];
}