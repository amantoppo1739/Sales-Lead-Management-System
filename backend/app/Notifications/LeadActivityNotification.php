<?php

namespace App\Notifications;

use App\Models\Activity;
use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class LeadActivityNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Activity $activity, public Lead $lead)
    {
        $this->activity->loadMissing('actor');
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function viaQueues(): array
    {
        $queue = config('queue.default', 'sync');

        return [
            'database' => $queue,
            'broadcast' => $queue,
        ];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'lead_id' => $this->lead->id,
            'lead_name' => $this->lead->company_name ?? trim($this->lead->first_name.' '.$this->lead->last_name),
            'action' => $this->activity->action,
            'properties' => $this->activity->properties,
            'actor' => $this->activity->actor ? [
                'id' => $this->activity->actor->id ?? null,
                'name' => method_exists($this->activity->actor, 'getAttribute')
                    ? trim(($this->activity->actor->first_name ?? '').' '.($this->activity->actor->last_name ?? ''))
                    : ($this->activity->actor->name ?? 'System'),
            ] : null,
            'occurred_at' => $this->activity->occurred_at?->toDateTimeString(),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}

