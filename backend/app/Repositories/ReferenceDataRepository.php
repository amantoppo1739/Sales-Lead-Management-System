<?php

namespace App\Repositories;

use App\Models\LeadSource;
use App\Models\Product;
use App\Models\Team;
use Closure;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

class ReferenceDataRepository
{
    public const CACHE_KEYS = [
        'lead_sources' => 'reference-data:lead_sources',
        'products' => 'reference-data:products',
        'teams' => 'reference-data:teams',
    ];

    public function leadSources(): Collection
    {
        return $this->remember(self::CACHE_KEYS['lead_sources'], function () {
            return LeadSource::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'uuid', 'name', 'slug', 'channel']);
        });
    }

    public function products(): Collection
    {
        return $this->remember(self::CACHE_KEYS['products'], function () {
            return Product::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'uuid', 'name', 'sku', 'type', 'price', 'currency']);
        });
    }

    public function teams(): Collection
    {
        return $this->remember(self::CACHE_KEYS['teams'], function () {
            return Team::query()
                ->orderBy('name')
                ->get(['id', 'uuid', 'name', 'territory_code']);
        });
    }

    public static function flushCache(): void
    {
        foreach (self::CACHE_KEYS as $key) {
            Cache::forget($key);
        }
    }

    protected function remember(string $key, Closure $callback): Collection
    {
        return Cache::remember($key, now()->addHour(), $callback);
    }
}

