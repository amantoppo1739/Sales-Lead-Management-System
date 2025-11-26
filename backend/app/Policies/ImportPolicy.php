<?php

namespace App\Policies;

use App\Models\Import;
use App\Models\User;

class ImportPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['manager', 'admin'], true);
    }

    public function view(User $user, Import $import): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'manager') {
            return $import->created_by_user_id === $user->id || $import->created_by_user_id === null;
        }

        return $import->created_by_user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['sales_rep', 'manager', 'admin'], true);
    }
}
