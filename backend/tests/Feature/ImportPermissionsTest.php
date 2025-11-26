<?php

namespace Tests\Feature;

use App\Jobs\ProcessLeadImportJob;
use App\Models\Import;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImportPermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_rep_can_create_import(): void
    {
        Storage::fake('local');
        Queue::fake();

        $rep = User::where('email', 'rep.na@example.com')->first();
        $file = UploadedFile::fake()->create('leads.csv', 10, 'text/csv');

        $this->actingAs($rep, 'web');

        $response = $this->postJson('/api/v1/imports/leads', [
            'file' => $file,
        ])->assertStatus(202);

        Queue::assertPushed(ProcessLeadImportJob::class);
    }

    public function test_rep_cannot_view_other_users_import(): void
    {
        $rep = User::where('email', 'rep.na@example.com')->first();
        $manager = User::where('email', 'manager@example.com')->first();

        $import = Import::factory()->create([
            'type' => 'leads',
            'created_by_user_id' => $manager->id,
        ]);

        $this->actingAs($rep, 'web');

        $this->getJson("/api/v1/imports/{$import->id}")
            ->assertStatus(403);
    }

    public function test_admin_can_view_any_import(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        $import = Import::factory()->create(['type' => 'leads']);

        $this->actingAs($admin, 'web');

        $this->getJson("/api/v1/imports/{$import->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $import->id);
    }
}

