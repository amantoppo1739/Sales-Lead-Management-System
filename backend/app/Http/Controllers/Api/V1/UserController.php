<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $query = User::with('team');

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($builder) use ($search): void {
                $builder
                    ->where('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('phone', 'like', '%'.$search.'%');
            });
        }

        if ($role = $request->string('role')->toString()) {
            $query->where('role', $role);
        }

        if ($teamId = $request->integer('team_id')) {
            $query->where('team_id', $teamId);
        }

        if ($status = $request->string('status')->toString()) {
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $perPage = (int) $request->integer('per_page', 25);
        $perPage = max(5, min(100, $perPage));

        return UserResource::collection(
            $query->latest()->paginate($perPage)->withQueryString()
        );
    }

    public function store(StoreUserRequest $request): UserResource
    {
        $this->authorize('create', User::class);

        $data = $request->validated();
        $data['password'] = $data['password'] ?? Str::random(16);

        $user = User::create($data);

        return new UserResource($user->load('team'));
    }

    public function show(User $user): UserResource
    {
        $this->authorize('view', $user);

        return new UserResource($user->load('team'));
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        $this->authorize('update', $user);

        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return new UserResource($user->fresh()->load('team'));
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        if ($request->user()->is($user)) {
            return response()->json([
                'message' => 'You cannot deactivate yourself.',
            ], 422);
        }

        $user->update(['is_active' => false]);
        $user->tokens()->delete();

        return response()->json([
            'message' => 'User deactivated successfully.',
        ]);
    }
}

