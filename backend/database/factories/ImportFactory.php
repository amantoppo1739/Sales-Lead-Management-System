<?php

namespace Database\Factories;

use App\Models\Import;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ImportFactory extends Factory
{
    protected $model = Import::class;

    public function definition(): array
    {
        return [
            'uuid' => $this->faker->uuid(),
            'type' => 'leads',
            'status' => 'pending',
            'file_path' => 'imports/'.$this->faker->uuid().'.csv',
            'total_rows' => 0,
            'processed_rows' => 0,
            'error_rows' => 0,
            'created_by_user_id' => User::factory(),
            'meta' => ['seed' => true],
        ];
    }
}

