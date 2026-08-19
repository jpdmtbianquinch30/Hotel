import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'connexion',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'inscription',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'chambres',
    loadComponent: () => import('./features/rooms/room-list/room-list').then((m) => m.RoomList),
  },
  {
    path: 'galerie',
    loadComponent: () =>
      import('./features/gallery/gallery-list/gallery-list').then((m) => m.GalleryList),
  },
  {
    path: 'mes-reservations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reservations/my-reservations/my-reservations').then(
        (m) => m.MyReservations
      ),
  },
  {
    path: 'profil',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
  },
    {
    path: 'reglements',
    loadComponent: () =>
      import('./features/rules/rules-list/rules-list').then((m) => m.RulesList),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
  },
  { path: '**', redirectTo: '' },
];