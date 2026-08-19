# 🏨 Hotel

Application de gestion hôtelière complète : catalogue de chambres, réservations en ligne, galerie photo et espace d'administration.

## Sommaire

- [Stack technique](#️-stack-technique)
- [Structure du projet](#-structure-du-projet)
- [Fonctionnalités](#-fonctionnalités)
- [API — endpoints](#-api--endpoints)
- [Installation (Docker)](#️-installation-docker--recommandé)
- [Variables d'environnement](#-variables-denvironnement-clés-backendenv)
- [Sécurité](#-sécurité)
- [Statut / limites connues](#-statut--limites-connues)
- [Licence](#-licence)

## 🏗️ Stack technique

| Couche           | Techno                                               |
|------------------|-------------------------------------------------------|
| Backend          | Laravel 12 (PHP 8.2+), Sanctum (auth API par token)   |
| Frontend         | Angular 20 (standalone components, signals), Tailwind CSS 4 |
| Base de données  | PostgreSQL 16                                          |
| Environnement    | Docker Compose (app / nginx / db)                      |

## 📁 Structure du projet

```
Hotel/
├── backend/                        # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/   # AuthController, RoomController, ReservationController, GalleryController
│   │   └── Models/                 # User, Room, Reservation, Guest, UserPreference, UserPrivacy, Gallery
│   ├── database/migrations/
│   ├── routes/api.php
│   ├── tests/                      # Feature / Unit (squelette par défaut Laravel)
│   ├── docker/                     # config nginx + php.ini custom
│   └── docker-compose.yml
├── frontend/                       # SPA Angular
│   └── src/app/
│       ├── core/                   # services, guards, intercepteurs, modèles
│       │   ├── services/           # auth, room, reservation, gallery
│       │   ├── guards/             # auth.guard, admin.guard
│       │   ├── interceptors/       # auth.interceptor
│       │   └── models/
│       ├── features/               # home, auth (login/register), rooms, gallery,
│       │                           # reservations/my-reservations, profile, admin/dashboard
│       └── shared/                 # navbar, footer
└── README.md
```

## ✨ Fonctionnalités

**Côté client**
- Inscription / connexion (Laravel Sanctum)
- Catalogue des chambres (type, prix, photo, disponibilité)
- Galerie photo de l'établissement
- Réservation en ligne (dates, lit supplémentaire, coordonnées)
- Suivi de « mes réservations » avec annulation
- Profil utilisateur

**Espace admin** (`/admin`, protégé par rôle `admin`)
- Gestion des chambres : création, modification, suppression, **upload de photo** (image, 10 Mo max)
- Gestion de la galerie : création, modification, suppression, upload de photo
- Gestion des réservations : vue globale, changement de statut (en attente, confirmée, arrivée, départ, annulée)

## 🔌 API — endpoints

**Publics**

| Méthode | Route              | Description                     |
|---------|--------------------|----------------------------------|
| POST    | `/api/register`    | Inscription                     |
| POST    | `/api/login`        | Connexion                       |
| GET     | `/api/rooms`         | Catalogue des chambres          |
| GET     | `/api/rooms/{room}`  | Détail d'une chambre            |
| GET     | `/api/gallery`       | Photos publiées de la galerie   |
| GET     | `/api/gallery/{gallery}` | Détail d'une photo          |

**Authentifiés** (`auth:sanctum`)

| Méthode | Route                              | Description                          |
|---------|-------------------------------------|----------------------------------------|
| POST    | `/api/logout`                       | Déconnexion                          |
| GET     | `/api/me`                           | Profil de l'utilisateur connecté     |
| POST    | `/api/rooms`                        | Créer une chambre (admin)            |
| PUT/POST| `/api/rooms/{room}`                 | Modifier une chambre (admin)         |
| DELETE  | `/api/rooms/{room}`                 | Supprimer une chambre (admin)        |
| GET     | `/api/gallery-admin`                | Vue admin de la galerie              |
| POST    | `/api/gallery`                      | Ajouter une photo (admin)            |
| PUT/POST| `/api/gallery/{gallery}`            | Modifier une photo (admin)           |
| DELETE  | `/api/gallery/{gallery}`            | Supprimer une photo (admin)          |
| GET     | `/api/reservations`                  | Liste des réservations               |
| POST    | `/api/reservations`                  | Créer une réservation                |
| GET     | `/api/reservations/{reservation}`    | Détail d'une réservation             |
| PATCH   | `/api/reservations/{reservation}/status` | Changer le statut (admin)       |
| DELETE  | `/api/reservations/{reservation}`    | Supprimer / annuler une réservation |

> Note : les routes `PUT` sont dupliquées en `POST` avec `_method=PUT` pour permettre l'upload de fichier en multipart (Laravel ne lit pas `$_FILES` sur une vraie requête `PUT`).

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

⚠️ Toujours lancer `storage:link` **depuis l'intérieur du conteneur** (`docker exec`), jamais depuis un PHP installé nativement sur la machine hôte — sinon le lien symbolique généré pointe vers un chemin propre à l'hôte (ex. `/mnt/host/c/...` sous Docker Desktop + WSL) que le conteneur `nginx` ne peut pas résoudre, et les photos ne s'affichent pas.

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
| `APP_KEY` | Clé de chiffrement Laravel — générée avec `php artisan key:generate`, **propre à chaque installation** |
| `DB_HOST` / `DB_PORT` | `db` / `5432` **depuis un conteneur** (réseau Docker interne) ; `127.0.0.1` / `5433` si tu exécutes `php artisan` **hors Docker**, directement sur l'hôte |
| `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | `hotel_db` / `hotel_user` / `hotel_pass` (définies dans `docker-compose.yml`) |

## 🔒 Sécurité

- Le fichier `.env` ne doit **jamais** être commité avec des valeurs réelles. Vérifie qu'aucun `.env` ne traîne à la racine du dépôt ou dans `backend/` — utilise `backend/.env.example` comme modèle et ajoute `.env` au `.gitignore`.
- Si une `APP_KEY` a été committée par erreur, régénère-la (`php artisan key:generate`) : toute donnée déjà chiffrée avec l'ancienne clé (sessions, cookies signés) devient invalide, c'est le comportement attendu.
- `APP_DEBUG=true` est acceptable en développement uniquement ; à désactiver avant toute mise en production.

## 🚧 Statut / limites connues

- Pas encore de vérification de chevauchement de dates à la réservation (double-booking possible)
- Pas de tests automatisés au-delà des exemples par défaut de Laravel (`ExampleTest.php`)
- Le seeder ne crée qu'un utilisateur de test, aucune chambre ni photo de démo

## 📄 Licence

Non spécifiée.