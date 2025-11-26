<?php

namespace App\Policies;

use App\Models\Lead;
use App\Models\User;

class LeadPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['sales_rep', 'manager', 'admin'], true);
    }

    public function view(User $user, Lead $lead): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'manager') {
            return $lead->team_id === $user->team_id;
        }

        return $lead->assigned_to_user_id === $user->id || $lead->created_by_user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['sales_rep', 'manager', 'admin'], true);
    }

    public function update(User $user, Lead $lead): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'manager') {
            return $lead->team_id === $user->team_id;
        }

        return $lead->assigned_to_user_id === $user->id;
    }

    public function delete(User $user, Lead $lead): bool
    {
        return in_array($user->role, ['manager', 'admin'], true)
            && ($user->role === 'admin' || $lead->team_id === $user->team_id);
    }
}
