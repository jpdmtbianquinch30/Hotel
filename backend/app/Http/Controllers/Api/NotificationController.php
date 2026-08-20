<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gallery;
use App\Models\Message;
use App\Models\Room;
use App\Models\Rule;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /** Public : dates du dernier élément publié par catégorie, pour les badges "nouveauté" côté client. */
    public function latest()
    {
        return response()->json([
            'rooms' => Room::max('created_at'),
            'gallery' => Gallery::where('is_published', true)->max('created_at'),
            'rules' => Rule::max('created_at'),
        ]);
    }

    /** Admin uniquement : nombre de messages/signalements non encore lus. */
    public function adminSummary(Request $request)
    {
        abort_unless($request->user()?->isAdmin(), 403, 'Accès réservé aux administrateurs.');

        return response()->json([
            'unread_messages' => Message::where('status', 'nouveau')
                ->where('type', 'contact')->count(),
            'unread_reports' => Message::where('status', 'nouveau')
                ->where('type', 'signalement')->count(),
        ]);
    }
}