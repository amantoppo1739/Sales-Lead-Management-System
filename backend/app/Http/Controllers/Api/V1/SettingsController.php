<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            abort(403);
        }

        $settings = SystemSetting::query()->get()->keyBy('key');

        return response()->json([
            'data' => [
                'general' => [
                    'company_name' => $settings['company.name']->value['value'] ?? 'Aurora CRM',
                    'default_currency' => $settings['company.currency']->value['value'] ?? 'INR',
                    'default_timezone' => $settings['company.timezone']->value['value'] ?? 'Asia/Kolkata',
                ],
                'features' => [
                    'tasks_enabled' => (bool) ($settings['features.tasks_enabled']->value['value'] ?? true),
                    'territory_map_enabled' => (bool) ($settings['features.territory_map_enabled']->value['value'] ?? false),
                ],
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            abort(403);
        }

        $payload = $request->validate([
            'general.company_name' => ['sometimes', 'string', 'max:255'],
            'general.default_currency' => ['sometimes', 'string', 'max:10'],
            'general.default_timezone' => ['sometimes', 'string', 'max:100'],
            'features.tasks_enabled' => ['sometimes', 'boolean'],
            'features.territory_map_enabled' => ['sometimes', 'boolean'],
        ]);

        $this->storeSetting('company.name', 'general', $payload['general']['company_name'] ?? null);
        $this->storeSetting('company.currency', 'general', $payload['general']['default_currency'] ?? null);
        $this->storeSetting('company.timezone', 'general', $payload['general']['default_timezone'] ?? null);

        if (array_key_exists('features', $payload)) {
            if (array_key_exists('tasks_enabled', $payload['features'])) {
                $this->storeSetting('features.tasks_enabled', 'features', $payload['features']['tasks_enabled']);
            }
            if (array_key_exists('territory_map_enabled', $payload['features'])) {
                $this->storeSetting('features.territory_map_enabled', 'features', $payload['features']['territory_map_enabled']);
            }
        }

        return $this->index($request);
    }

    protected function storeSetting(string $key, string $group, mixed $value): void
    {
        if ($value === null) {
            return;
        }

        SystemSetting::updateOrCreate(
            ['key' => $key],
            ['group' => $group, 'value' => ['value' => $value]]
        );
    }
}


