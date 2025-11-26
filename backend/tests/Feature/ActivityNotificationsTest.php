<?php

namespace Tests\Feature;

use App\Events\ActivityLogged;
use App\Models\Lead;
use App\Models\LeadSource;
use App\Models\Team;
use App\Models\User;
use App\Notifications\LeadActivityNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Tests\TestCase;

class ActivityNotificationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_activity_creation_dispatches_event_and_notifications(): void
    {
        Event::fake([ActivityLogged::class]);
        Notification::fake();

        $team = Team::create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Ops',
            'territory_code' => 'NA',
        ]);

        $manager = User::factory()->create([
            'uuid' => (string) Str::uuid(),
            'team_id' => $team->id,
            'role' => 'manager',
        ]);
        $team->update(['manager_id' => $manager->id]);

        $rep = User::factory()->create([
            'uuid' => (string) Str::uuid(),
            'team_id' => $team->id,
            'role' => 'sales_rep',
        ]);

        $source = LeadSource::create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Web',
            'slug' => 'web',
            'channel' => 'web',
        ]);

        $lead = Lead::create([
            'uuid' => (string) Str::uuid(),
            'first_name' => 'Test',
            'last_name' => 'Lead',
            'status' => 'new',
            'stage' => 'new',
            'team_id' => $team->id,
            'source_id' => $source->id,
            'assigned_to_user_id' => $rep->id,
            'created_by_user_id' => $manager->id,
        ]);

        $lead->activities()->create([
            'action' => 'lead.updated',
            'actor_type' => User::class,
            'actor_id' => $manager->id,
            'properties' => ['status' => 'qualified'],
            'occurred_at' => now(),
        ]);

        Event::assertDispatched(ActivityLogged::class);

        Notification::assertSentTo(
            [$rep, $manager],
            LeadActivityNotification::class
        );
    }
}

