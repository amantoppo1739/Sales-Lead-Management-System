<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['nullable', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'role' => ['required', 'in:admin,manager,sales_rep'],
            'team_id' => ['nullable', 'exists:teams,id'],
            'is_active' => ['sometimes', 'boolean'],
            'timezone' => ['nullable', 'string', 'max:100'],
            'password' => ['required', 'string', 'min:8'],
        ];
    }
}

