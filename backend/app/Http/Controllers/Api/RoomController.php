<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;

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
            'photo' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'is_available' => ['boolean'],
        ]);

        $room = Room::create($data);

        return response()->json($room, 201);
    }

    public function update(Request $request, Room $room)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'room_type' => ['sometimes', 'string', 'max:50'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'photo' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'is_available' => ['boolean'],
        ]);

        $room->update($data);

        return response()->json($room);
    }

    public function destroy(Request $request, Room $room)
    {
        $this->authorizeAdmin($request);

        $room->delete();

        return response()->json(['message' => 'Chambre supprimée.']);
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403, 'Accès réservé aux administrateurs.');
    }
}
