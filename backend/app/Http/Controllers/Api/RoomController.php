<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomController extends Controller
{
    public function index()
    {
        return response()->json(Room::orderBy('price')->get());
    }

    public function show(Room $room)
    {
        return response()->json($room);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'room_type' => ['required', 'string', 'max:50'],
            'price' => ['required', 'numeric', 'min:0'],
            'photo' => ['nullable', 'image', 'max:10240'], // 10 Mo max
            'description' => ['nullable', 'string'],
            'is_available' => ['boolean'],
        ]);

        if ($request->hasFile('photo')) {
            $data['photo'] = $this->storePhoto($request);
        }

        $room = Room::create($data);

        return response()->json($room, 201);
    }

    public function update(Request $request, Room $room)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'room_type' => ['sometimes', 'string', 'max:50'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'photo' => ['nullable', 'image', 'max:10240'],
            'remove_photo' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string'],
            'is_available' => ['boolean'],
        ]);

        if ($request->hasFile('photo')) {
            $this->deleteExistingPhoto($room);
            $data['photo'] = $this->storePhoto($request);
        } elseif ($request->boolean('remove_photo')) {
            $this->deleteExistingPhoto($room);
            $data['photo'] = null;
        }

        unset($data['remove_photo']);

        $room->update($data);

        return response()->json($room);
    }

    public function destroy(Request $request, Room $room)
    {
        $this->authorizeAdmin($request);

        $this->deleteExistingPhoto($room);
        $room->delete();

        return response()->json(['message' => 'Chambre supprimée.']);
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403, 'Accès réservé aux administrateurs.');
    }

    /** Enregistre le fichier uploadé sur le disque public et retourne son URL absolue. */
    private function storePhoto(Request $request): string
    {
        $path = $request->file('photo')->store('rooms', 'public');

        return url(Storage::url($path));
    }

    /** Supprime l'ancienne photo du disque si elle a été stockée localement (ignore les URL externes). */
    private function deleteExistingPhoto(Room $room): void
    {
        if (! $room->photo || ! str_contains($room->photo, '/storage/rooms/')) {
            return;
        }

        $relative = 'rooms/'.basename($room->photo);
        Storage::disk('public')->delete($relative);
    }
}