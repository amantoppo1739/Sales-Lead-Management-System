<?php

use App\Models\Lead;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('leads.{leadId}', function ($user, int $leadId) {
    return $user !== null;
});

Broadcast::channel('teams.{teamId}', function ($user, int $teamId) {
    return (int) ($user?->team_id) === $teamId;
});

