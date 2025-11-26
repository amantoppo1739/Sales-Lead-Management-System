<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Lead;
use App\Models\Note;
use App\Models\Team;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MetricsController extends Controller
{
    public function teamUsers(Request $request, Team $team): JsonResponse
    {
        $user = $request->user();

        // Basic authorization: sales reps have no access to team metrics
        if ($user->role === 'sales_rep') {
            abort(403, 'You are not authorized to view team metrics.');
        }

        // Managers can only see their own team; admins can see any team
        if ($user->role === 'manager' && $user->team_id !== $team->id) {
            abort(403, 'You are not authorized to view this team.');
        }

        $from = $request->date('from') ?? CarbonImmutable::now()->startOfMonth();
        $to = $request->date('to') ?? CarbonImmutable::now();

        // Normalize to full-day range
        $from = $from->startOfDay();
        $to = $to->endOfDay();

        // Team members
        $users = User::query()
            ->where('team_id', $team->id)
            ->where('is_active', true)
            ->get(['id', 'first_name', 'last_name', 'email', 'role']);

        $userIds = $users->pluck('id')->all();

        // Leads created in range per creator
        $leadsCreated = Lead::query()
            ->selectRaw('created_by_user_id as user_id, count(*) as count')
            ->whereIn('created_by_user_id', $userIds)
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('created_by_user_id')
            ->pluck('count', 'user_id');

        // Leads owned (assigned) in range per owner
        $leadsOwned = Lead::query()
            ->selectRaw('assigned_to_user_id as user_id, count(*) as count')
            ->whereIn('assigned_to_user_id', $userIds)
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('assigned_to_user_id')
            ->pluck('count', 'user_id');

        // Status breakdown per owner
        $statusBreakdown = Lead::query()
            ->selectRaw('assigned_to_user_id as user_id, status, count(*) as count')
            ->whereIn('assigned_to_user_id', $userIds)
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('assigned_to_user_id', 'status')
            ->get()
            ->groupBy('user_id')
            ->map(function ($rows) {
                $statuses = [
                    'new' => 0,
                    'qualified' => 0,
                    'contacted' => 0,
                    'converted' => 0,
                    'lost' => 0,
                ];

                foreach ($rows as $row) {
                    $status = $row->status ?? 'new';
                    if (! array_key_exists($status, $statuses)) {
                        $statuses[$status] = 0;
                    }
                    $statuses[$status] += (int) $row->count;
                }

                return $statuses;
            });

        // Revenue per rep per month (sum of potential_value for converted leads, grouped by created_at month).
        // Implemented in PHP so it works across SQLite/MySQL/Postgres.
        $convertedLeads = Lead::query()
            ->select(['assigned_to_user_id', 'potential_value', 'created_at'])
            ->whereIn('assigned_to_user_id', $userIds)
            ->where('status', 'converted')
            ->whereBetween('created_at', [$from, $to])
            ->get();

        $revenueByUser = [];
        $allMonths = [];

        foreach ($convertedLeads as $lead) {
            /** @var \App\Models\Lead $lead */
            $userId = (int) $lead->assigned_to_user_id;
            $month = CarbonImmutable::parse($lead->created_at)->startOfMonth()->toDateString(); // e.g. 2025-11-01

            $allMonths[$month] = true;

            if (! isset($revenueByUser[$userId])) {
                $revenueByUser[$userId] = [];
            }

            if (! isset($revenueByUser[$userId][$month])) {
                $revenueByUser[$userId][$month] = 0.0;
            }

            $revenueByUser[$userId][$month] += (float) $lead->potential_value;
        }

        $months = collect(array_keys($allMonths))
            ->sort()
            ->values()
            ->all();

        // Activity counts per rep (notes + activities)
        $noteCounts = Note::query()
            ->selectRaw('author_id as user_id, count(*) as count')
            ->whereIn('author_id', $userIds)
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('author_id')
            ->pluck('count', 'user_id');

        $activityCounts = Activity::query()
            ->selectRaw('actor_id as user_id, count(*) as count')
            ->where('actor_type', User::class)
            ->whereIn('actor_id', $userIds)
            ->whereBetween('occurred_at', [$from, $to])
            ->groupBy('actor_id')
            ->pluck('count', 'user_id');

        $perUser = $users->map(function (User $member) use (
            $leadsCreated,
            $leadsOwned,
            $statusBreakdown,
            $revenueByUser,
            $months,
            $noteCounts,
            $activityCounts,
        ) {
            $userId = $member->id;
            $statusCounts = $statusBreakdown->get($userId, [
                'new' => 0,
                'qualified' => 0,
                'contacted' => 0,
                'converted' => 0,
                'lost' => 0,
            ]);

            $userRevenueSeries = [];
            foreach ($months as $month) {
                $userRevenueSeries[] = [
                    'month' => $month,
                    'revenue' => isset($revenueByUser[$userId][$month]) ? (float) $revenueByUser[$userId][$month] : 0.0,
                ];
            }

            return [
                'user' => [
                    'id' => $member->id,
                    'name' => trim($member->first_name.' '.$member->last_name),
                    'email' => $member->email,
                    'role' => $member->role,
                ],
                'leads' => [
                    'created' => (int) ($leadsCreated[$userId] ?? 0),
                    'owned' => (int) ($leadsOwned[$userId] ?? 0),
                ],
                'statuses' => $statusCounts,
                'revenue' => [
                    'series' => $userRevenueSeries,
                ],
                'activities' => [
                    'notes' => (int) ($noteCounts[$userId] ?? 0),
                    'activities' => (int) ($activityCounts[$userId] ?? 0),
                ],
            ];
        })->values();

        return response()->json([
            'data' => [
                'team' => [
                    'id' => $team->id,
                    'name' => $team->name,
                ],
                'period' => [
                    'from' => $from->toDateString(),
                    'to' => $to->toDateString(),
                ],
                'months' => $months,
                'users' => $perUser,
            ],
        ]);
    }
}


