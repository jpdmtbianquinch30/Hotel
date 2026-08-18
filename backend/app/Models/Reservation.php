<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'guest_id',
        'room_id',
        'room_no',
        'extra_bed',
        'status',
        'days',
        'checkin',
        'checkin_time',
        'checkout',
        'checkout_time',
        'bill',
    ];

    protected function casts(): array
    {
        return [
            'extra_bed' => 'boolean',
            'checkin' => 'date',
            'checkout' => 'date',
            'bill' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
