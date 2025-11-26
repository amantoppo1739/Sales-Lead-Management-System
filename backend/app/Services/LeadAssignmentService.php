<?php

namespace App\Services;

use App\Events\LeadBroadcastEvent;
use App\Models\Lead;
use App\Models\User;
use App\Services\LeadAssignment\LeadAssignmentStrategy;

class LeadAssignmentService
{
    /**
     * @param  iterable<LeadAssignmentStrategy>  $strategies
     */
    public function __construct(private readonly iterable $strategies)
    {
    }

    public function assign(Lead $lead, ?int $preferredUserId = null): ?User
    {
        if ($lead->assigned_to_user_id) {
            return $lead->loadMissing('owner')->owner;
        }

        if ($preferredUserId) {
            $preferred = User::query()
                ->whereKey($preferredUserId)
                ->where('is_active', true)
                ->first();

            if ($preferred) {
                return $this->persistAssignment($lead, $preferred);
            }
        }

        foreach ($this->strategies as $strategy) {
            $assignee = $strategy->assign($lead);
            if ($assignee) {
                return $this->persistAssignment($lead, $assignee);
            }
        }

        return null;
    }

    protected function persistAssignment(Lead $lead, User $assignee): User
    {
        $lead->assigned_to_user_id = $assignee->id;
        $lead->save();
        $lead->load(['owner', 'team']);

        event(new LeadBroadcastEvent($lead, 'Assigned'));

        return $assignee;
    }
}

