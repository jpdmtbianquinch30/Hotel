<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rule;
use Illuminate\Http\Request;

class RuleController extends Controller
{
    /** Liste publique, triée par position. */
    public function index()
    {
        return response()->json(Rule::orderBy('position')->get());
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'content' => ['required', 'string'],
        ]);

        $data['position'] = (int) Rule::max('position') + 1;

        $rule = Rule::create($data);

        return response()->json($rule, 201);
    }

    public function update(Request $request, Rule $rule)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:150'],
            'content' => ['sometimes', 'string'],
        ]);

        $rule->update($data);

        return response()->json($rule);
    }

    public function destroy(Request $request, Rule $rule)
    {
        $this->authorizeAdmin($request);

        $rule->delete();

        return response()->json(['message' => 'Règlement supprimé.']);
    }

    /** Réordonne l'ensemble des règles selon la liste d'ids fournie (ordre = nouvelle position). */
    public function reorder(Request $request)
    {
        $this->authorizeAdmin($request);

        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:rules,id'],
        ]);

        foreach ($data['ids'] as $index => $id) {
            Rule::where('id', $id)->update(['position' => $index]);
        }

        return response()->json(Rule::orderBy('position')->get());
    }

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403, 'Accès réservé aux administrateurs.');
    }
}