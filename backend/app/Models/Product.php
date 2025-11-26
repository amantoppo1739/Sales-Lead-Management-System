<?php

namespace App\Models;

use App\Models\Concerns\FlushesReferenceCache;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;
    use FlushesReferenceCache;

    protected $fillable = [
        'uuid',
        'name',
        'sku',
        'type',
        'price',
        'currency',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function leads()
    {
        return $this->belongsToMany(Lead::class)->withPivot(['quantity', 'price'])->withTimestamps();
    }

    protected static function booted(): void
    {
        static::creating(function (self $product) {
            if (blank($product->uuid)) {
                $product->uuid = (string) Str::uuid();
            }
        });
    }
}
