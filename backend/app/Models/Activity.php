<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'action',
        'actor_type',
        'actor_id',
        'subject_type',
        'subject_id',
        'properties',
        'occurred_at',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
        'properties' => 'array',
    ];

    public function actor()
    {
        return $this->morphTo();
    }

    public function subject()
    {
        return $this->morphTo();
    }
}
