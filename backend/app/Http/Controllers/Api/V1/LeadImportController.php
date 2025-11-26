<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessLeadImportJob;
use App\Models\Import;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadImportController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Import::class);

        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,csv'],
        ]);

        $file = $data['file'];
        $path = $file->store('imports');

        $import = Import::create([
            'type' => 'leads',
            'status' => 'pending',
            'file_path' => $path,
            'created_by_user_id' => $request->user()->id,
            'meta' => [
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ],
        ]);

        ProcessLeadImportJob::dispatch($import->id, $request->user()->id);

        return response()->json([
            'message' => 'Import started',
            'import' => $import,
        ], 202);
    }

    public function show(Request $request, Import $import): JsonResponse
    {
        $this->authorize('view', $import);

        return response()->json([
            'data' => [
                'id' => $import->id,
                'uuid' => $import->uuid,
                'status' => $import->status,
                'total_rows' => $import->total_rows,
                'processed_rows' => $import->processed_rows,
                'error_rows' => $import->error_rows,
                'meta' => $import->meta,
                'started_at' => $import->started_at,
                'finished_at' => $import->finished_at,
                'errors' => $import->errors,
            ],
        ]);
    }
}
