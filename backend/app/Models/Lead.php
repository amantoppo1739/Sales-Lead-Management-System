<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Lead extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'reference',
        'first_name',
        'last_name',
        'company_name',
        'email',
        'phone',
        'status',
        'stage',
        'assigned_to_user_id',
        'created_by_user_id',
        'team_id',
        'source_id',
        'territory_code',
        'potential_value',
        'currency',
        'lifecycle_stage',
        'expected_close_date',
        'last_contacted_at',
        'next_action_at',
        'address',
        'metadata',
    ];

    protected $casts = [
        'address' => 'array',
        'metadata' => 'array',
        'expected_close_date' => 'date',
        'last_contacted_at' => 'datetime',
        'next_action_at' => 'datetime',
        'potential_value' => 'decimal:2',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function source()
    {
        return $this->belongsTo(LeadSource::class);
    }

    public function statusHistories()
    {
        return $this->hasMany(LeadStatusHistory::class);
    }

    public function scores()
    {
        return $this->hasMany(LeadScore::class);
    }

    public function latestScore()
    {
        return $this->hasOne(LeadScore::class)->latestOfMany();
    }

    public function activities()
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    public function notes()
    {
        return $this->morphMany(Note::class, 'notable');
    }

    public function products()
    {
        return $this->belongsToMany(Product::class)->withPivot(['quantity', 'price'])->withTimestamps();
    }

    protected static function booted(): void
    {
        static::creating(function (self $lead) {
            if (blank($lead->uuid)) {
                $lead->uuid = (string) Str::uuid();
            }
        });
    }
}
