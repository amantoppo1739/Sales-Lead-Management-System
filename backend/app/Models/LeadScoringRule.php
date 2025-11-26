<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadScoringRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'name',
        'weights',
        'thresholds',
    ];

    protected $casts = [
        'weights' => 'array',
        'thresholds' => 'array',
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}

