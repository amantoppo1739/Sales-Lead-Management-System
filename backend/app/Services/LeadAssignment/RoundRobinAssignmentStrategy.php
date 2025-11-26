<?php

namespace App\Services\LeadAssignment;

use App\Models\Lead;
use App\Models\User;

class RoundRobinAssignmentStrategy implements LeadAssignmentStrategy
{
    public function assign(Lead $lead): ?User
    {
        return User::query()
            ->where('is_active', true)
            ->whereIn('role', ['sales_rep', 'manager'])
            ->when($lead->team_id, fn ($query) => $query->where('team_id', $lead->team_id))
            ->withCount('assignedLeads')
            ->orderBy('assigned_leads_count')
            ->orderBy('id')
            ->first();
    }
}

