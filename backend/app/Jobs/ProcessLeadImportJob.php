<?php

namespace App\Jobs;

use App\Jobs\CalculateLeadScoreJob;
use App\Events\LeadBroadcastEvent;
use App\Models\Import;
use App\Models\Lead;
use App\Services\LeadAssignmentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\HeadingRowImport;

class ProcessLeadImportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $importId,
        public int $userId,
    ) {}

    public function handle(LeadAssignmentService $assignmentService): void
    {
        /** @var Import|null $import */
        $import = Import::find($this->importId);

        if (! $import) {
            return;
        }

        $import->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);

        if (! Storage::disk('local')->exists($import->file_path)) {
            $import->update([
                'status' => 'failed',
                'errors' => ['File missing from storage.'],
                'finished_at' => now(),
            ]);

            return;
        }

        $collection = Excel::toCollection(new HeadingRowImport, storage_path('app/'.$import->file_path))->first() ?? collect();

        $import->update(['total_rows' => $collection->count()]);

        $processed = 0;
        $errors = 0;

        foreach ($collection as $index => $row) {
            $rowModel = $import->rows()->create([
                'row_number' => $index + 2,
                'payload' => $row,
                'status' => 'processing',
            ]);

            try {
                $payload = $this->mapRowToLeadAttributes($row);
                $payload['created_by_user_id'] = $this->userId;
                $lead = Lead::create($payload);

                $assignmentService->assign($lead);
                $lead->load(['owner', 'team', 'source', 'products', 'latestScore']);
                event(new LeadBroadcastEvent($lead, 'Created'));
                CalculateLeadScoreJob::dispatch($lead->id, $this->userId);

                $rowModel->update([
                    'status' => 'processed',
                    'processed_at' => now(),
                ]);

                $processed++;
            } catch (\Throwable $exception) {
                $rowModel->update([
                    'status' => 'failed',
                    'errors' => [$exception->getMessage()],
                    'processed_at' => now(),
                ]);

                $errors++;
            }

            $import->update([
                'processed_rows' => $processed,
                'error_rows' => $errors,
            ]);
        }

        $import->update([
            'status' => $errors > 0 ? 'completed_with_errors' : 'completed',
            'finished_at' => now(),
        ]);
    }

    protected function mapRowToLeadAttributes($row): array
    {
        $metadata = $row['metadata'] ?? null;
        if (is_string($metadata)) {
            $decoded = json_decode($metadata, true);
            $metadata = json_last_error() === JSON_ERROR_NONE ? $decoded : null;
        }

        return [
            'first_name' => $row['first_name'] ?? null,
            'last_name' => $row['last_name'] ?? null,
            'company_name' => $row['company_name'] ?? null,
            'email' => $row['email'] ?? null,
            'phone' => $row['phone'] ?? null,
            'status' => $row['status'] ?? 'new',
            'stage' => $row['stage'] ?? ($row['status'] ?? 'new'),
            'team_id' => $row['team_id'] ?? null,
            'source_id' => $row['source_id'] ?? null,
            'potential_value' => $row['potential_value'] ?? null,
            'currency' => $row['currency'] ?? 'USD',
            'territory_code' => $row['territory_code'] ?? null,
            'metadata' => $metadata,
        ];
    }
}
