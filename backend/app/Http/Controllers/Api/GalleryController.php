<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    /** Liste publique : uniquement les images publiées, filtrable par catégorie. */
    public function index(Request $request)
    {
        $query = Gallery::query()->where('is_published', true);

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        $items = $query->withCount('likes')->latest()->get();
        $this->appendIsLiked($request, $items);

        return response()->json($items);
    }
     public function show(Request $request, Gallery $gallery)
    {
        $gallery->loadCount('likes');
        $this->appendIsLiked($request, collect([$gallery]));

        return response()->json($gallery);
    }
    public function toggleLike(Request $request, Gallery $gallery)
    {
        $user = $request->user();
        $existing = $gallery->likes()->where('user_id', $user->id)->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            $gallery->likes()->create(['user_id' => $user->id]);
            $liked = true;
        }

        return response()->json([
            'liked' => $liked,
            'likes_count' => $gallery->likes()->count(),
        ]);
    }

    private function appendIsLiked(Request $request, $items): void
    {
        $user = $request->user('sanctum');
        $likedIds = $user
            ? $user->likes()->where('likeable_type', Gallery::class)->pluck('likeable_id')
            : collect();

        $items->each(fn ($item) => $item->is_liked = $likedIds->contains($item->id));
    }

    /** Liste admin : toutes les images (publiées ou non), pour la gestion. */
    public function adminIndex(Request $request)
    {
        $this->authorizeAdmin($request);

        return response()->json(Gallery::latest()->get());
    }


    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'category' => ['required', 'string', 'max:50'],
            'image' => ['required', 'image', 'max:10240'], // 10 Mo max
            'description' => ['nullable', 'string'],
            'is_published' => ['boolean'],
        ]);

        $data['image'] = $this->storeImage($request);

        $gallery = Gallery::create($data);

        return response()->json($gallery, 201);
    }

    public function update(Request $request, Gallery $gallery)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:100'],
            'category' => ['sometimes', 'string', 'max:50'],
            'image' => ['nullable', 'image', 'max:10240'],
            'description' => ['nullable', 'string'],
            'is_published' => ['boolean'],
        ]);

        if ($request->hasFile('image')) {
            $this->deleteExistingImage($gallery);
            $data['image'] = $this->storeImage($request);
        }

        $gallery->update($data);

        return response()->json($gallery);
    }

    public function destroy(Request $request, Gallery $gallery)
    {
        $this->authorizeAdmin($request);

        $this->deleteExistingImage($gallery);
        $gallery->delete();

        return response()->json(['message' => 'Image supprimée.']);
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403, 'Accès réservé aux administrateurs.');
    }

    /** Enregistre le fichier uploadé sur le disque public et retourne son URL absolue. */
    private function storeImage(Request $request): string
    {
        $path = $request->file('image')->store('galleries', 'public');

        return url(Storage::url($path));
    }

    /** Supprime l'ancienne image du disque si elle a été stockée localement (ignore les URL externes). */
    private function deleteExistingImage(Gallery $gallery): void
    {
        if (! $gallery->image || ! str_contains($gallery->image, '/storage/galleries/')) {
            return;
        }

        $relative = 'galleries/'.basename($gallery->image);
        Storage::disk('public')->delete($relative);
    }
}