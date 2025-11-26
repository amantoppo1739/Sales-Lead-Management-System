<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\LeadBroadcastEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Lead\StoreLeadNoteRequest;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;

class LeadNoteController extends Controller
{
    public function store(StoreLeadNoteRequest $request, Lead $lead): JsonResponse
    {
        $this->authorize('update', $lead);

        $note = $lead->notes()->create([
            'author_id' => $request->user()->id,
            'body' => $request->validated('body'),
            'metadata' => array_filter([
                'pinned' => $request->boolean('pinned'),
            ]),
        ]);

        $lead->activities()->create([
            'action' => 'note.created',
            'actor_type' => $request->user()::class,
            'actor_id' => $request->user()->id,
            'properties' => [
                'note_id' => $note->id,
            ],
            'occurred_at' => now(),
        ]);

        $note->load('author');
        event(new LeadBroadcastEvent($lead->load(['notes.author']), 'NoteAdded'));

        return response()->json([
            'message' => 'Note added',
            'data' => [
                'id' => $note->id,
                'body' => $note->body,
                'created_at' => $note->created_at?->toIso8601String(),
                'author' => $note->author ? [
                    'id' => $note->author->id,
                    'name' => trim($note->author->first_name.' '.$note->author->last_name),
                    'role' => $note->author->role,
                ] : null,
            ],
        ], 201);
    }
}

