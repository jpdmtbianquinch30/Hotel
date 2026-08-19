<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\RoomController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    
// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Chambres : lecture publique (catalogue), écriture réservée à l'admin (dans le contrôleur)
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{room}', [RoomController::class, 'show']);

// Galerie : lecture publique (images publiées uniquement), gestion réservée à l'admin
Route::get('/gallery', [GalleryController::class, 'index']);
Route::get('/gallery/{gallery}', [GalleryController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/rooms', [RoomController::class, 'store']);
    // PUT classique + POST avec _method=PUT (utilisé par le frontend pour l'upload de fichier,
    // Laravel ne lit pas $_FILES sur une vraie requête PUT multipart).
    Route::put('/rooms/{room}', [RoomController::class, 'update']);
    Route::post('/rooms/{room}', [RoomController::class, 'update']);
    Route::delete('/rooms/{room}', [RoomController::class, 'destroy']);

    Route::get('/gallery-admin', [GalleryController::class, 'adminIndex']);
    Route::post('/gallery', [GalleryController::class, 'store']);
    // POST avec _method=PUT (upload de fichier, cf. rooms)
    Route::put('/gallery/{gallery}', [GalleryController::class, 'update']);
    Route::post('/gallery/{gallery}', [GalleryController::class, 'update']);
    Route::delete('/gallery/{gallery}', [GalleryController::class, 'destroy']);

    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations/{reservation}', [ReservationController::class, 'show']);
    Route::patch('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus']);
    Route::delete('/reservations/{reservation}', [ReservationController::class, 'destroy']);
});