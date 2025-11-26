<?php

namespace App\Models;

use App\Models\Concerns\FlushesReferenceCache;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LeadSource extends Model
{
    use HasFactory;
    use FlushesReferenceCache;

    protected $fillable = [
        'uuid',
        'name',
        'slug',
        'channel',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    public function leads()
    {
        return $this->hasMany(Lead::class, 'source_id');
    }

    protected static function booted(): void
    {
        static::creating(function (self $source) {
            if (blank($source->uuid)) {
                $source->uuid = (string) Str::uuid();
            }
        });
    }
}
