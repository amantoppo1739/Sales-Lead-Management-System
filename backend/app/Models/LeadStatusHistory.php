<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadStatusHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'lead_id',
        'from_status',
        'to_status',
        'changed_by_user_id',
        'comment',
        'changed_at',
    ];

    protected $casts = [
        'changed_at' => 'datetime',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }
}
