<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\Like;
use App\Models\Room;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    /** Renvoie les chambres et photos de galerie likées par l'utilisateur connecté, pour la page profil. */
    public function myLikes(Request $request)
    {
        $user = $request->user();

        $roomIds = Like::where('user_id', $user->id)->where('likeable_type', Room::class)->pluck('likeable_id');
        $galleryIds = Like::where('user_id', $user->id)->where('likeable_type', Gallery::class)->pluck('likeable_id');

        return response()->json([
            'rooms' => Room::withCount('likes')->whereIn('id', $roomIds)->get()
                ->each(fn ($r) => $r->is_liked = true),
            'gallery' => Gallery::withCount('likes')->whereIn('id', $galleryIds)->get()
                ->each(fn ($g) => $g->is_liked = true),
        ]);
    }
}