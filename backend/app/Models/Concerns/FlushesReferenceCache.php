<?php

namespace App\Models\Concerns;

use App\Repositories\ReferenceDataRepository;

trait FlushesReferenceCache
{
    public static function bootFlushesReferenceCache(): void
    {
        static::saved(function (): void {
            ReferenceDataRepository::flushCache();
        });

        static::deleted(function (): void {
            ReferenceDataRepository::flushCache();
        });
    }
}

