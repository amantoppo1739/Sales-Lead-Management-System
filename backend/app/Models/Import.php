<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Import extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'type',
        'status',
        'file_path',
        'total_rows',
        'processed_rows',
        'error_rows',
        'created_by_user_id',
        'meta',
        'errors',
        'started_at',
        'finished_at',
    ];

    protected $casts = [
        'meta' => 'array',
        'errors' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function rows()
    {
        return $this->hasMany(ImportRow::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    protected static function booted(): void
    {
        static::creating(function (self $import): void {
            if (blank($import->uuid)) {
                $import->uuid = (string) Str::uuid();
            }
        });
    }
}
