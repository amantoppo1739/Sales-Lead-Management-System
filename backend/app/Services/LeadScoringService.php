<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\LeadScoringRule;

class LeadScoringService
{
    protected array $rulesCache = [];

    public function calculate(Lead $lead): array
    {
        $weights = $this->resolveWeights($lead);
        $score = 0;
        $breakdown = [];

        $source = $lead->source?->channel;
        $sourceWeight = $weights['source'][$source] ?? $weights['source']['default'];
        $score += $sourceWeight;
        $breakdown['source'] = $sourceWeight;

        $engagementWeight = 0;
        if ($lead->last_contacted_at) {
            $engagementWeight += $weights['engagement']['last_contacted'];
        }
        if ($lead->next_action_at) {
            $engagementWeight += $weights['engagement']['next_action'];
        }
        $score += $engagementWeight;
        $breakdown['engagement'] = $engagementWeight;

        $valueWeight = 0;
        foreach ($weights['value'] as $tier) {
            if ($lead->potential_value >= $tier['min']) {
                $valueWeight = $tier['score'];
                break;
            }
        }
        $score += $valueWeight;
        $breakdown['value'] = $valueWeight;

        $stageWeight = $weights['status'][$lead->status] ?? $weights['status']['default'];
        $score += $stageWeight;
        $breakdown['stage'] = $stageWeight;

        return [
            'score' => min(100, (int) $score),
            'breakdown' => $breakdown,
        ];
    }

    protected function resolveWeights(Lead $lead): array
    {
        $cacheKey = $lead->team_id ?? 'default';

        if (! array_key_exists($cacheKey, $this->rulesCache)) {
            $rule = LeadScoringRule::query()
                ->where(function ($query) use ($lead): void {
                    $query->where('team_id', $lead->team_id)
                        ->orWhereNull('team_id');
                })
                ->orderByRaw('(team_id = ?) desc', [$lead->team_id])
                ->orderByDesc('team_id')
                ->first();

            $this->rulesCache[$cacheKey] = array_replace_recursive(
                $this->defaultWeights(),
                $rule?->weights ?? []
            );
        }

        return $this->rulesCache[$cacheKey];
    }

    protected function defaultWeights(): array
    {
        return [
            'source' => [
                'web' => 30,
                'referral' => 25,
                'event' => 20,
                'partner' => 15,
                'default' => 10,
            ],
            'engagement' => [
                'last_contacted' => 15,
                'next_action' => 10,
            ],
            'value' => [
                ['min' => 50000, 'score' => 30],
                ['min' => 20000, 'score' => 20],
                ['min' => 5000, 'score' => 15],
                ['min' => 0, 'score' => 5],
            ],
            'status' => [
                'converted' => 20,
                'qualified' => 15,
                'contacted' => 10,
                'new' => 5,
                'default' => 0,
            ],
        ];
    }
}

