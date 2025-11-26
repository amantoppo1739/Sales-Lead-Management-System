<?php

namespace App\Models;

use App\Models\Concerns\FlushesReferenceCache;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Team extends Model
{
    use HasFactory;
    use FlushesReferenceCache;

    protected $fillable = [
        'uuid',
        'name',
        'territory_code',
        'manager_id',
        'description',
    ];

    public function members()
    {
        return $this->hasMany(User::class);
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    protected static function booted(): void
    {
        static::creating(function (self $team) {
            if (blank($team->uuid)) {
                $team->uuid = (string) Str::uuid();
            }
        });
    }
}
