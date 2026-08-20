<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /** Réception publique : message de contact ou signalement, connecté ou non. */
    public function store(Request $request)
    {
        $user = $request->user('sanctum');

        $data = $request->validate([
            'type' => ['required', 'in:contact,signalement'],
            'name' => [$user ? 'sometimes' : 'required', 'string', 'max:255'],
            'email' => [$user ? 'sometimes' : 'required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $message = Message::create([
            'user_id' => $user?->id,
            'type' => $data['type'],
            'name' => $user->name ?? $data['name'],
            'email' => $user->email ?? $data['email'],
            'phone' => $data['phone'] ?? $user->phone ?? null,
            'subject' => $data['subject'],
            'message' => $data['message'],
        ]);

        return response()->json($message, 201);
    }

    public function index(Request $request)
    {
        $this->authorizeAdmin($request);

        return response()->json(Message::orderByDesc('created_at')->get());
    }

    public function updateStatus(Request $request, Message $message)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'status' => ['required', 'in:nouveau,lu,traite'],
        ]);

        $message->update($data);

        return response()->json($message);
    }

    public function destroy(Request $request, Message $message)
    {
        $this->authorizeAdmin($request);

        $message->delete();

        return response()->json(['message' => 'Message supprimé.']);
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403, 'Accès réservé aux administrateurs.');
    }
}