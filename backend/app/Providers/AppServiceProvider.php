<?php

namespace App\Providers;

use App\Models\Activity;
use App\Observers\ActivityObserver;
use App\Services\LeadAssignment\RoundRobinAssignmentStrategy;
use App\Services\LeadAssignment\TerritoryAssignmentStrategy;
use App\Services\LeadAssignmentService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(LeadAssignmentService::class, function ($app) {
            return new LeadAssignmentService([
                $app->make(TerritoryAssignmentStrategy::class),
                $app->make(RoundRobinAssignmentStrategy::class),
            ]);
        });
    }

    public function boot(): void
    {
        Activity::observe(ActivityObserver::class);
    }
}
