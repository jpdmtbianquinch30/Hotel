<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorizeAdmin($request);

        return response()->json(User::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'in:admin,client'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'role' => $data['role'],
        ]);

        return response()->json($user, 201);
    }

    public function update(Request $request, User $user)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:users,email,'.$user->id],
            'password' => ['nullable', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['sometimes', 'in:admin,client'],
        ]);

        // Empêche un admin de se retirer lui-même son rôle (il se retrouverait bloqué hors de /admin)
        if ($request->user()->id === $user->id && isset($data['role']) && $data['role'] !== 'admin') {
            abort(422, 'Tu ne peux pas retirer ton propre rôle administrateur.');
        }

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json($user);
    }

    public function destroy(Request $request, User $user)
    {
        $this->authorizeAdmin($request);

        if ($request->user()->id === $user->id) {
            abort(422, 'Tu ne peux pas supprimer ton propre compte.');
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403, 'Accès réservé aux administrateurs.');
    }
}