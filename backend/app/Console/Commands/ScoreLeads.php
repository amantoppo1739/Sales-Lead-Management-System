<?php

namespace App\Console\Commands;

use App\Jobs\CalculateLeadScoreJob;
use App\Models\Lead;
use Illuminate\Console\Command;

class ScoreLeads extends Command
{
    protected $signature = 'leads:score {--chunk=200} {--queue : Dispatch the scoring job to the queue instead of running synchronously}';

    protected $description = 'Recalculate lead scores for all records';

    public function handle(): int
    {
        $chunkSize = (int) $this->option('chunk');
        $useQueue = (bool) $this->option('queue');

        $this->components->info("Scoring leads in chunks of {$chunkSize} (queue: ".($useQueue ? 'yes' : 'no').')');

        Lead::query()->select('id')->chunkById($chunkSize, function ($leads) use ($useQueue) {
            foreach ($leads as $lead) {
                if ($useQueue) {
                    CalculateLeadScoreJob::dispatch($lead->id);
                } else {
                    CalculateLeadScoreJob::dispatchSync($lead->id);
                }
            }
        });

        $this->components->info('Lead scoring completed.');

        return self::SUCCESS;
    }
}
