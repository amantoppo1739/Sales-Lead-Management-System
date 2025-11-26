<?php

namespace App\Events;

use App\Http\Resources\LeadResource;
use App\Models\Lead;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LeadBroadcastEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Lead $lead,
        public string $type = 'Updated',
    ) {
        if ($type !== 'Deleted') {
            $this->lead->loadMissing(['owner', 'team', 'source', 'products', 'latestScore']);
        }
    }

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('leads.'.$this->lead->id),
        ];

        if ($this->lead->team_id) {
            $channels[] = new PrivateChannel('teams.'.$this->lead->team_id);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'Lead'.$this->type;
    }

    public function broadcastWith(): array
    {
        if ($this->type === 'Deleted') {
            return [
                'id' => $this->lead->id,
                'uuid' => $this->lead->uuid,
                'deleted' => true,
            ];
        }

        return LeadResource::make($this->lead)->resolve();
    }
}
