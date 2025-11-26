<?php

namespace App\Jobs;

use App\Events\LeadBroadcastEvent;
use App\Models\Lead;
use App\Models\LeadScore;
use App\Services\LeadScoringService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CalculateLeadScoreJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $leadId,
        public ?int $triggeredBy = null,
    ) {}

    public function handle(LeadScoringService $scoringService): void
    {
        $lead = Lead::with(['source', 'latestScore'])->find($this->leadId);

        if (! $lead) {
            return;
        }

        $result = $scoringService->calculate($lead);

        $lead->scores()->create([
            'score' => $result['score'],
            'breakdown' => $result['breakdown'],
            'calculated_by_user_id' => $this->triggeredBy,
            'calculated_at' => now(),
        ]);

        $lead->load(['owner', 'team', 'source', 'products', 'latestScore']);

        event(new LeadBroadcastEvent($lead, 'Scored'));
    }
}
