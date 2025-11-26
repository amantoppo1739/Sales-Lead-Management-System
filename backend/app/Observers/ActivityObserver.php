<?php

namespace App\Observers;

use App\Events\ActivityLogged;
use App\Models\Activity;
use App\Models\Lead;
use App\Models\User;
use App\Notifications\LeadActivityNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Notification;

class ActivityObserver
{
    public function created(Activity $activity): void
    {
        if ($activity->subject_type !== Lead::class) {
            return;
        }

        $lead = Lead::query()
            ->with(['owner', 'team'])
            ->find($activity->subject_id);

        if (! $lead) {
            return;
        }

        event(new ActivityLogged($activity, $lead));

        $recipients = $this->resolveRecipients($lead);

        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new LeadActivityNotification($activity, $lead));
        }
    }

    protected function resolveRecipients(Lead $lead): Collection
    {
        $manager = $lead->team?->manager_id
            ? User::query()->find($lead->team->manager_id)
            : null;

        return collect([
            $lead->owner,
            $manager,
            $lead->creator,
        ])->filter()->unique('id');
    }
}

