<?php

namespace App\Services\LeadAssignment;

use App\Models\Lead;
use App\Models\User;

interface LeadAssignmentStrategy
{
    public function assign(Lead $lead): ?User;
}

