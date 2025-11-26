<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'score',
        'breakdown',
        'calculated_by_user_id',
        'calculated_at',
    ];

    protected $casts = [
        'breakdown' => 'array',
        'calculated_at' => 'datetime',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function calculator()
    {
        return $this->belongsTo(User::class, 'calculated_by_user_id');
    }
}
