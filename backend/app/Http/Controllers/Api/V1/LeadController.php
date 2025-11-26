<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Events\LeadBroadcastEvent;
use App\Http\Requests\Lead\StoreLeadRequest;
use App\Http\Requests\Lead\UpdateLeadRequest;
use App\Http\Resources\LeadResource;
use App\Jobs\CalculateLeadScoreJob;
use App\Models\Lead;
use App\Models\LeadStatusHistory;
use App\Models\User;
use App\Services\LeadAssignmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class LeadController extends Controller
{
    public function __construct(
        private LeadAssignmentService $assignmentService,
    ) {}

    public function index(Request $request)
    {
        $this->authorize('viewAny', Lead::class);

        $user = $request->user();
        $query = Lead::query()->with(['owner', 'team', 'source', 'products', 'latestScore']);

        // Filter by user permissions
        if ($user->role === 'sales_rep') {
            // Sales reps only see their own leads
            $query->where(function ($q) use ($user) {
                $q->where('assigned_to_user_id', $user->id)
                  ->orWhere('created_by_user_id', $user->id);
            });
        } elseif ($user->role === 'manager') {
            // Managers see leads from their team
            $query->where('team_id', $user->team_id);
        }
        // Admins see all leads (no additional filter)

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($teamId = $request->integer('team_id')) {
            $query->where('team_id', $teamId);
        }

        if ($ownerId = $request->integer('owner_id')) {
            $query->where('assigned_to_user_id', $ownerId);
        }

        if ($request->filled('search')) {
            $term = '%'.$request->string('search')->toString().'%';
            $query->where(function ($inner) use ($term) {
                $inner->where('first_name', 'like', $term)
                    ->orWhere('last_name', 'like', $term)
                    ->orWhere('company_name', 'like', $term)
                    ->orWhere('email', 'like', $term);
            });
        }

        $perPage = min(100, max(5, (int) $request->input('per_page', 25)));

        return LeadResource::collection(
            $query->latest()->paginate($perPage)->withQueryString()
        );
    }

    public function store(StoreLeadRequest $request)
    {
        $this->authorize('create', Lead::class);

        $payload = $request->validated();
        $products = Arr::pull($payload, 'products', []);

        $payload['created_by_user_id'] = $request->user()->id;
        $payload['team_id'] = $payload['team_id'] ?? $request->user()->team_id;
        $payload['stage'] = $payload['stage'] ?? $payload['status'] ?? 'new';

        $lead = Lead::create($payload);
        $this->assignmentService->assign($lead);
        $this->syncProducts($lead, $products);

        LeadStatusHistory::create([
            'lead_id' => $lead->id,
            'from_status' => null,
            'to_status' => $lead->status,
            'changed_by_user_id' => $request->user()->id,
            'comment' => $request->input('status_comment'),
            'changed_at' => now(),
        ]);

        CalculateLeadScoreJob::dispatch($lead->id, $request->user()->id);
        $lead->load(['owner', 'team', 'source', 'products', 'latestScore']);
        $this->recordActivity($lead, 'lead.created', $request->user(), [
            'status' => $lead->status,
            'stage' => $lead->stage,
        ]);
        event(new LeadBroadcastEvent($lead, 'Created'));

        return new LeadResource($lead);
    }

    public function show(Lead $lead)
    {
        $this->authorize('view', $lead);

        $lead->load([
            'owner',
            'team',
            'source',
            'products',
            'latestScore',
            'notes' => fn ($query) => $query->latest()->with('author'),
            'activities' => fn ($query) => $query->latest('occurred_at')->with('actor'),
            'statusHistories' => fn ($query) => $query->latest('changed_at')->with('actor'),
        ]);

        return new LeadResource($lead);
    }

    public function update(UpdateLeadRequest $request, Lead $lead)
    {
        $this->authorize('update', $lead);

        $payload = $request->validated();
        $products = Arr::pull($payload, 'products', null);

        $originalStatus = $lead->status;

        $lead->fill($payload);
        $changes = $lead->getDirty();
        $lead->save();

        if (! is_null($products)) {
            $this->syncProducts($lead, $products);
        }

        if ($lead->wasChanged('status')) {
            LeadStatusHistory::create([
                'lead_id' => $lead->id,
                'from_status' => $originalStatus,
                'to_status' => $lead->status,
                'changed_by_user_id' => $request->user()->id,
                'comment' => $request->input('status_comment'),
                'changed_at' => now(),
            ]);
        }

        CalculateLeadScoreJob::dispatch($lead->id, $request->user()->id);
        $lead->load(['owner', 'team', 'source', 'products', 'latestScore']);
        $this->recordActivity($lead, 'lead.updated', $request->user(), [
            'changed_fields' => array_keys($changes),
            'status' => $lead->status,
        ]);
        event(new LeadBroadcastEvent($lead, 'Updated'));

        return new LeadResource($lead);
    }

    public function destroy(Request $request, Lead $lead)
    {
        $this->authorize('delete', $lead);

        $leadId = $lead->id;
        $this->recordActivity($lead, 'lead.deleted', $request->user(), [
            'status' => $lead->status,
        ]);
        $lead->delete();

        event(new LeadBroadcastEvent($lead->setRelation('latestScore', null), 'Deleted'));

        return response()->json(['message' => 'Lead archived', 'id' => $leadId]);
    }

    protected function syncProducts(Lead $lead, array $products): void
    {
        if (empty($products)) {
            return;
        }

        $syncPayload = collect($products)->mapWithKeys(function ($product) {
            return [
                $product['product_id'] => [
                    'quantity' => $product['quantity'] ?? 1,
                    'price' => $product['price'] ?? null,
                ],
            ];
        })->toArray();

        $lead->products()->sync($syncPayload);
    }

    protected function recordActivity(Lead $lead, string $action, ?User $actor, array $properties = []): void
    {
        $lead->activities()->create([
            'action' => $action,
            'actor_type' => $actor ? $actor::class : User::class,
            'actor_id' => $actor?->id,
            'properties' => $properties,
            'occurred_at' => now(),
        ]);
    }
}
