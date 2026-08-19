# Hotel

Application de gestion hôtelière : catalogue de chambres, réservations en ligne et espace d'administration complet.

## 🏗️ Stack technique

| Couche       | Techno                          |
|--------------|----------------------------------|
| Backend      | Laravel 12 (PHP 8.2+), Sanctum (auth API par token) |
| Frontend     | Angular 20 (standalone components, signals), Tailwind CSS 4 |
| Base de données | PostgreSQL 16 |
| Environnement | Docker Compose (app / nginx / db) |

## 📁 Structure du projet

```
Hotel/
├── backend/                 # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/   # AuthController, RoomController, ReservationController
│   │   └── Models/                 # User, Room, Reservation, Guest, UserPreference, UserPrivacy
│   ├── database/migrations/
│   ├── routes/api.php
│   ├── docker/                     # config nginx + php.ini custom
│   └── docker-compose.yml
├── frontend/                # SPA Angular
│   └── src/app/
│       ├── core/            # services, guards, intercepteurs, modèles
│       ├── features/        # home, auth, rooms, reservations, profile, admin/dashboard
│       └── shared/          # navbar, footer
└── README.md
```

## ✨ Fonctionnalités

**Côté client**
- Inscription / connexion (Laravel Sanctum)
- Catalogue des chambres (type, prix, photo, disponibilité)
- Réservation en ligne avec formulaire (dates, lit supplémentaire, coordonnées)
- Suivi de « mes réservations » avec annulation
- Profil utilisateur

**Espace admin** (`/admin`, protégé par rôle `admin`)
- Gestion des chambres : création, modification, suppression, **upload de photo** (fichier image, 10 Mo max)
- Gestion des réservations : vue globale, changement de statut (en attente, confirmée, arrivée, départ, annulée)

## ⚙️ Installation (Docker — recommandé)

### Prérequis
- Docker Desktop

### Démarrage

```bash
cd backend
docker compose up -d --build
```

Ça lance 3 conteneurs :
- `hotel_app` — PHP-FPM / Laravel
- `hotel_nginx` — serveur web, exposé sur **http://localhost:8080**
- `hotel_db` — PostgreSQL, exposé sur le port **5433** (accessible depuis l'hôte pour un client SQL)

### Initialisation de la base

```bash
docker exec hotel_app php artisan migrate
docker exec hotel_app php artisan storage:link
```

⚠️ Toujours lancer `storage:link` **depuis l'intérieur du conteneur** (`docker exec`), jamais depuis un PHP installé nativement sur la machine hôte — sinon le lien symbolique généré pointe vers un chemin propre à l'hôte (ex. `/mnt/host/c/...` sous Docker Desktop + WSL) que le conteneur `nginx` ne peut pas résoudre, et les photos de chambres ne s'affichent pas.

### Créer un compte administrateur

```bash
docker exec hotel_app php artisan tinker --execute="App\Models\User::updateOrCreate(['email' => 'admin@hotel.com'], ['name' => 'Admin', 'password' => 'mot-de-passe-a-changer', 'role' => 'admin']);"
```

Le rôle doit valoir exactement `admin` pour débloquer l'accès à `/admin`.

### Frontend

```bash
cd frontend
npm install
npm start        # ng serve, sert sur http://localhost:4200
```

Le frontend appelle l'API sur `http://localhost:8080/api` (voir `src/environments/environment.ts`).

## 🔧 Variables d'environnement clés (`backend/.env`)

| Variable | Description |
|---|---|
| `APP_URL` | Doit correspondre au port exposé par nginx (`http://localhost:8080`), sert à générer les URLs absolues des photos |
| `DB_HOST` / `DB_PORT` | `db` / `5432` **depuis un conteneur** (réseau Docker interne) ; `127.0.0.1` / `5433` si tu exécutes `php artisan` **hors Docker**, directement sur l'hôte |
| `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | `hotel_db` / `hotel_user` / `hotel_pass` (définies dans `docker-compose.yml`) |

## 🔒 Sécurité

- Le fichier `.env` ne doit jamais être commité avec de vraies valeurs sensibles. `backend/.gitignore` l'exclut déjà — vérifie qu'aucun `.env` ne traîne à la racine du dépôt.
- `APP_DEBUG=true` est acceptable en développement uniquement ; le désactiver avant toute mise en production.

## 🚧 Statut / limites connues

- Pas encore de vérification de chevauchement de dates à la réservation (double-booking possible)
- Pas de tests automatisés au-delà des exemples par défaut de Laravel
- Le seeder ne crée qu'un utilisateur de test, aucune chambre de démo

## 📄 Licence

Non spécifiée.