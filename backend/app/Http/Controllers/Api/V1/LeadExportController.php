<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LeadExportController extends Controller
{
    public function __invoke(Request $request)
    {
        $this->authorize('viewAny', Lead::class);

        $user = $request->user();
        $format = $request->string('format', 'csv')->toString();
        $format = in_array($format, ['csv', 'xlsx']) ? $format : 'csv';

        $query = Lead::query()->with(['owner', 'team', 'source']);

        // Filter by user permissions
        if ($user->role === 'sales_rep') {
            $query->where(function ($q) use ($user) {
                $q->where('assigned_to_user_id', $user->id)
                  ->orWhere('created_by_user_id', $user->id);
            });
        } elseif ($user->role === 'manager') {
            $query->where('team_id', $user->team_id);
        }

        // Apply filters
        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($teamId = $request->integer('team_id')) {
            $query->where('team_id', $teamId);
        }

        if ($ownerId = $request->integer('owner_id')) {
            $query->where('assigned_to_user_id', $ownerId);
        }

        if ($request->filled('search')) {
            $term = '%'.$request->string('search')->toString().'%';
            $query->where(function ($inner) use ($term) {
                $inner->where('first_name', 'like', $term)
                    ->orWhere('last_name', 'like', $term)
                    ->orWhere('company_name', 'like', $term)
                    ->orWhere('email', 'like', $term);
            });
        }

        $leads = $query->latest()->get();

        $filename = 'leads_export_'.now()->format('Y-m-d_His').'.'.$format;

        if ($format === 'csv') {
            return $this->exportCsv($leads, $filename);
        }

        return $this->exportXlsx($leads, $filename);
    }

    protected function exportCsv($leads, string $filename): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"; filename*=UTF-8''".rawurlencode($filename),
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Pragma' => 'public',
        ];

        return Response::stream(function () use ($leads) {
            $file = fopen('php://output', 'w');

            // Write BOM for Excel UTF-8 compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Headers
            fputcsv($file, [
                'ID',
                'Reference',
                'First Name',
                'Last Name',
                'Company Name',
                'Email',
                'Phone',
                'Status',
                'Stage',
                'Potential Value',
                'Currency',
                'Territory Code',
                'Source',
                'Team',
                'Assigned To',
                'Expected Close Date',
                'Created At',
            ], ',');

            // Data rows
            foreach ($leads as $lead) {
                fputcsv($file, [
                    $lead->id,
                    $lead->reference ?? '',
                    $lead->first_name ?? '',
                    $lead->last_name ?? '',
                    $lead->company_name ?? '',
                    $lead->email ?? '',
                    $lead->phone ?? '',
                    $lead->status ?? '',
                    $lead->stage ?? '',
                    $lead->potential_value ?? '',
                    $lead->currency ?? 'USD',
                    $lead->territory_code ?? '',
                    $lead->source?->name ?? '',
                    $lead->team?->name ?? '',
                    $lead->owner ? trim($lead->owner->first_name.' '.$lead->owner->last_name) : '',
                    $lead->expected_close_date?->format('Y-m-d') ?? '',
                    $lead->created_at?->format('Y-m-d H:i:s') ?? '',
                ], ',');
            }

            fclose($file);
        }, 200, $headers);
    }

    protected function exportXlsx($leads, string $filename)
    {
        // For XLSX, we'll use a simple CSV-like approach or you can install maatwebsite/excel
        // For now, let's return CSV with .xlsx extension as a fallback
        // In production, you'd use: return Excel::download(new LeadsExport($leads), $filename);
        
        return $this->exportCsv($leads, str_replace('.xlsx', '.csv', $filename));
    }
}

