<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadPermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_sales_rep_can_view_and_update_assigned_lead(): void
    {
        $rep = User::where('email', 'rep.na@example.com')->first();
        $lead = Lead::where('assigned_to_user_id', $rep->id)->first();
        $lead->assigned_to_user_id = $rep->id;
        $lead->save();
        $this->actingAs($rep, 'web');

        $this->getJson("/api/v1/leads/{$lead->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $lead->id);

        $this->patchJson("/api/v1/leads/{$lead->id}", [
            'status' => 'qualified',
        ])->assertOk();
    }

    public function test_rep_cannot_delete_lead(): void
    {
        $rep = User::where('email', 'rep.na@example.com')->first();
        $lead = Lead::where('assigned_to_user_id', $rep->id)->first();
        $lead->assigned_to_user_id = $rep->id;
        $lead->save();

        $this->actingAs($rep, 'web');

        $this->deleteJson("/api/v1/leads/{$lead->id}")
            ->assertStatus(403);
    }

    public function test_manager_can_delete_team_lead(): void
    {
        $manager = User::where('email', 'manager@example.com')->first();
        $lead = Lead::where('team_id', $manager->team_id)->first();

        $this->actingAs($manager, 'web');

        $this->deleteJson("/api/v1/leads/{$lead->id}")
            ->assertOk();
    }

    public function test_rep_can_add_note_to_assigned_lead(): void
    {
        $rep = User::where('email', 'rep.na@example.com')->first();
        $lead = Lead::where('assigned_to_user_id', $rep->id)->first();

        $this->actingAs($rep, 'web');

        $payload = ['body' => 'Scheduled follow-up demo for next Tuesday.'];

        $this->postJson("/api/v1/leads/{$lead->id}/notes", $payload)
            ->assertCreated()
            ->assertJsonPath('data.body', $payload['body']);

        $this->assertDatabaseHas('notes', [
            'notable_id' => $lead->id,
            'body' => $payload['body'],
        ]);
    }

    public function test_rep_cannot_add_note_to_unassigned_lead(): void
    {
        $rep = User::where('email', 'rep.na@example.com')->first();
        $lead = Lead::where('assigned_to_user_id', '!=', $rep->id)->first();

        $this->actingAs($rep, 'web');

        $this->postJson("/api/v1/leads/{$lead->id}/notes", [
            'body' => 'Attempting to add note to someone else lead.',
        ])->assertStatus(403);
    }
}
