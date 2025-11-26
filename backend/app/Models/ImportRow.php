<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImportRow extends Model
{
    use HasFactory;

    protected $fillable = [
        'import_id',
        'row_number',
        'payload',
        'status',
        'errors',
        'processed_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'errors' => 'array',
        'processed_at' => 'datetime',
    ];

    public function import()
    {
        return $this->belongsTo(Import::class);
    }
}
