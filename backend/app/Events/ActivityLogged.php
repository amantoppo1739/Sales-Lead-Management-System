<?php

namespace App\Events;

use App\Models\Activity;
use App\Models\Lead;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ActivityLogged implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(public Activity $activity, public ?Lead $lead = null)
    {
        $this->activity->loadMissing('actor');

        if ($this->lead || $this->activity->subject instanceof Lead) {
            $this->lead = $this->lead ?? $this->activity->subject;
            $this->lead?->loadMissing(['owner', 'team']);
        }
    }

    public function broadcastOn(): array
    {
        $channels = [];

        if ($this->lead) {
            $channels[] = new PrivateChannel('leads.'.$this->lead->id);

            if ($this->lead->team_id) {
                $channels[] = new PrivateChannel('teams.'.$this->lead->team_id);
            }

            if ($this->lead->assigned_to_user_id) {
                $channels[] = new PrivateChannel('users.'.$this->lead->assigned_to_user_id);
            }
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'ActivityLogged';
    }

    public function broadcastWith(): array
    {
        return [
            'lead' => $this->lead ? [
                'id' => $this->lead->id,
                'name' => $this->lead->company_name ?? trim($this->lead->first_name.' '.$this->lead->last_name),
                'status' => $this->lead->status,
            ] : null,
            'activity' => [
                'id' => $this->activity->id,
                'action' => $this->activity->action,
                'properties' => $this->activity->properties,
                'occurred_at' => $this->activity->occurred_at?->toDateTimeString(),
                'actor' => $this->activity->actor ? [
                    'id' => $this->activity->actor->id ?? null,
                    'name' => method_exists($this->activity->actor, 'getAttribute')
                        ? trim(($this->activity->actor->first_name ?? '').' '.($this->activity->actor->last_name ?? ''))
                        : ($this->activity->actor->name ?? 'System'),
                ] : null,
            ],
        ];
    }
}

