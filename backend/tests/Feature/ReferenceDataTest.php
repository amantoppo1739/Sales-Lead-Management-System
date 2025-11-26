<?php

namespace Tests\Feature;

use App\Models\LeadSource;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferenceDataTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_reference_data_endpoint_returns_cached_collections(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();

        $response = $this
            ->actingAs($admin, 'web')
            ->getJson('/api/v1/reference-data');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'lead_sources',
                    'products',
                    'teams',
                ],
            ]);

        $payload = $response->json('data');

        $this->assertNotEmpty($payload['lead_sources']);
        $this->assertNotEmpty($payload['products']);
        $this->assertNotEmpty($payload['teams']);

        $source = LeadSource::first();
        $source->name = 'Updated Source';
        $source->save();

        $refreshResponse = $this
            ->actingAs($admin, 'web')
            ->getJson('/api/v1/reference-data');

        $refreshResponse
            ->assertOk()
            ->assertJsonFragment(['name' => 'Updated Source']);
    }
}

