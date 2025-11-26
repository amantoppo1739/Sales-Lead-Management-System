<?php

namespace App\Http\Resources;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'reference' => $this->reference,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'company_name' => $this->company_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status,
            'stage' => $this->stage,
            'lifecycle_stage' => $this->lifecycle_stage,
            'potential_value' => $this->potential_value,
            'currency' => $this->currency,
            'territory_code' => $this->territory_code,
            'expected_close_date' => optional($this->expected_close_date)->toDateString(),
            'last_contacted_at' => optional($this->last_contacted_at)->toDateTimeString(),
            'next_action_at' => optional($this->next_action_at)->toDateTimeString(),
            'address' => $this->address,
            'metadata' => $this->metadata,
            'source' => $this->whenLoaded('source', fn () => [
                'id' => $this->source->id,
                'name' => $this->source->name,
            ]),
            'team' => $this->whenLoaded('team', fn () => [
                'id' => $this->team->id,
                'name' => $this->team->name,
            ]),
            'owner' => $this->whenLoaded('owner', fn () => [
                'id' => $this->owner->id,
                'name' => trim($this->owner->first_name.' '.$this->owner->last_name),
                'email' => $this->owner->email,
            ]),
            'score' => $this->whenLoaded('latestScore', function () {
                return [
                    'value' => $this->latestScore->score,
                    'breakdown' => $this->latestScore->breakdown,
                    'calculated_at' => $this->latestScore->calculated_at?->toDateTimeString(),
                ];
            }),
            'products' => $this->whenLoaded('products', function () {
                return $this->products->map(fn ($product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'pivot' => [
                        'quantity' => $product->pivot->quantity,
                        'price' => $product->pivot->price,
                    ],
                ]);
            }),
            'notes' => $this->whenLoaded('notes', function () {
                return $this->notes->map(fn ($note) => [
                    'id' => $note->id,
                    'body' => $note->body,
                    'metadata' => $note->metadata,
                    'created_at' => $note->created_at?->toDateTimeString(),
                    'author' => $note->author ? [
                        'id' => $note->author->id,
                        'name' => trim($note->author->first_name.' '.$note->author->last_name),
                        'role' => $note->author->role,
                    ] : null,
                ]);
            }),
            'status_history' => $this->whenLoaded('statusHistories', function () {
                return $this->statusHistories->map(fn ($history) => [
                    'id' => $history->id,
                    'from_status' => $history->from_status,
                    'to_status' => $history->to_status,
                    'comment' => $history->comment,
                    'changed_at' => $history->changed_at?->toDateTimeString(),
                    'actor' => $history->actor ? [
                        'id' => $history->actor->id,
                        'name' => trim($history->actor->first_name.' '.$history->actor->last_name),
                        'role' => $history->actor->role,
                    ] : null,
                ]);
            }),
            'activities' => $this->whenLoaded('activities', function () {
                return $this->activities->map(function ($activity) {
                    $actor = null;
                    if ($activity->actor instanceof \Illuminate\Database\Eloquent\Model) {
                        $actor = [
                            'id' => $activity->actor->id ?? null,
                            'name' => trim(($activity->actor->first_name ?? '').' '.($activity->actor->last_name ?? '')) ?: ($activity->actor->name ?? 'System'),
                        ];
                    }

                    return [
                        'id' => $activity->id,
                        'action' => $activity->action,
                        'properties' => $activity->properties,
                        'occurred_at' => $activity->occurred_at?->toDateTimeString(),
                        'actor' => $actor,
                    ];
                });
            }),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
