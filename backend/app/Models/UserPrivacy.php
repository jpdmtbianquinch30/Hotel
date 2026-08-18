<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPrivacy extends Model
{
    protected $table = 'user_privacy';

    protected $fillable = [
        'user_id',
        'profile_visibility',
        'show_activity',
        'data_sharing',
        'two_factor_auth',
    ];

    protected function casts(): array
    {
        return [
            'show_activity' => 'boolean',
            'data_sharing' => 'boolean',
            'two_factor_auth' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
