<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\LeadController;
use App\Http\Controllers\Api\V1\LeadExportController;
use App\Http\Controllers\Api\V1\LeadImportController;
use App\Http\Controllers\Api\V1\LeadNoteController;
use App\Http\Controllers\Api\V1\ReferenceDataController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\MetricsController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        Route::get('leads/export', LeadExportController::class);
        Route::apiResource('leads', LeadController::class);
        Route::post('leads/{lead}/notes', [LeadNoteController::class, 'store']);
        Route::post('imports/leads', [LeadImportController::class, 'store']);
        Route::get('imports/{import}', [LeadImportController::class, 'show']);
        Route::get('reference-data', ReferenceDataController::class);
        Route::apiResource('users', UserController::class);
        Route::get('settings', [SettingsController::class, 'index']);
        Route::put('settings', [SettingsController::class, 'update']);

        Route::get('metrics/teams/{team}/users', [MetricsController::class, 'teamUsers']);
    });
});

