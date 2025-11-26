<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'team_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'role',
        'is_active',
        'timezone',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function assignedLeads()
    {
        return $this->hasMany(Lead::class, 'assigned_to_user_id');
    }

    public function createdLeads()
    {
        return $this->hasMany(Lead::class, 'created_by_user_id');
    }

    protected static function booted(): void
    {
        static::creating(function (self $user) {
            if (blank($user->uuid)) {
                $user->uuid = (string) Str::uuid();
            }
        });
    }
}
