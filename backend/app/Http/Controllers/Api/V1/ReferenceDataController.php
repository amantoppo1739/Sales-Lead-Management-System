<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Repositories\ReferenceDataRepository;
use Illuminate\Http\JsonResponse;

class ReferenceDataController extends Controller
{
    public function __construct(private readonly ReferenceDataRepository $repository)
    {
    }

    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => [
                'lead_sources' => $this->repository->leadSources(),
                'products' => $this->repository->products(),
                'teams' => $this->repository->teams(),
            ],
        ]);
    }
}

