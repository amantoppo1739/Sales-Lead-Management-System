<?php

namespace App\Services\LeadAssignment;

use App\Models\Lead;
use App\Models\Team;
use App\Models\User;

class TerritoryAssignmentStrategy implements LeadAssignmentStrategy
{
    public function assign(Lead $lead): ?User
    {
        if (blank($lead->territory_code)) {
            return null;
        }

        $team = Team::query()
            ->where('territory_code', $lead->territory_code)
            ->first();

        if (! $team) {
            return null;
        }

        return User::query()
            ->where('team_id', $team->id)
            ->where('is_active', true)
            ->whereIn('role', ['sales_rep'])
            ->withCount('assignedLeads')
            ->orderBy('assigned_leads_count')
            ->orderBy('id')
            ->first();
    }
}

