<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Reservation::with(['guest', 'room']);

        // Un client ne voit que ses réservations, l'admin voit tout
        if (! $user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'room_id' => ['required', 'exists:rooms,id'],
            'firstname' => ['required', 'string', 'max:50'],
            'middlename' => ['nullable', 'string', 'max:30'],
            'lastname' => ['required', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'contact_no' => ['nullable', 'string', 'max:20'],
            'extra_bed' => ['boolean'],
            'days' => ['required', 'integer', 'min:1'],
            'checkin' => ['required', 'date'],
            'checkout' => ['required', 'date', 'after_or_equal:checkin'],
        ]);

        $room = Room::findOrFail($data['room_id']);

        $guest = Guest::create([
            'firstname' => $data['firstname'],
            'middlename' => $data['middlename'] ?? null,
            'lastname' => $data['lastname'],
            'address' => $data['address'] ?? null,
            'contact_no' => $data['contact_no'] ?? null,
        ]);

        $bill = $room->price * $data['days'];

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'guest_id' => $guest->id,
            'room_id' => $room->id,
            'extra_bed' => $data['extra_bed'] ?? false,
            'status' => 'pending',
            'days' => $data['days'],
            'checkin' => $data['checkin'],
            'checkout' => $data['checkout'],
            'bill' => $bill,
        ]);

        return response()->json($reservation->load(['guest', 'room']), 201);
    }

    public function show(Request $request, Reservation $reservation)
    {
        $this->authorizeOwnerOrAdmin($request, $reservation);

        return response()->json($reservation->load(['guest', 'room', 'user']));
    }

    public function updateStatus(Request $request, Reservation $reservation)
    {
        abort_unless($request->user()->isAdmin(), 403, 'Accès réservé aux administrateurs.');

        $data = $request->validate([
            'status' => ['required', 'in:pending,confirmed,checked_in,checked_out,cancelled'],
        ]);

        $reservation->update($data);

        return response()->json($reservation);
    }

    public function destroy(Request $request, Reservation $reservation)
    {
        $this->authorizeOwnerOrAdmin($request, $reservation);

        $reservation->delete();

        return response()->json(['message' => 'Réservation annulée.']);
    }

    private function authorizeOwnerOrAdmin(Request $request, Reservation $reservation): void
    {
        $user = $request->user();
        abort_unless($user->isAdmin() || $reservation->user_id === $user->id, 403);
    }
}
