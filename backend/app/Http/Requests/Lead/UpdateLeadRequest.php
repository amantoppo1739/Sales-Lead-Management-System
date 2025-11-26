<?php

namespace App\Http\Requests\Lead;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['sometimes', 'nullable', 'string', 'max:120'],
            'last_name' => ['sometimes', 'nullable', 'string', 'max:120'],
            'company_name' => ['sometimes', 'nullable', 'string', 'max:150'],
            'email' => ['sometimes', 'nullable', 'email', 'max:150'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'status' => ['sometimes', 'string', 'in:new,qualified,contacted,converted,lost'],
            'stage' => ['sometimes', 'string', 'max:50'],
            'assigned_to_user_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'team_id' => ['sometimes', 'nullable', 'exists:teams,id'],
            'source_id' => ['sometimes', 'nullable', 'exists:lead_sources,id'],
            'territory_code' => ['sometimes', 'nullable', 'string', 'max:25'],
            'potential_value' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'nullable', 'string', 'size:3'],
            'lifecycle_stage' => ['sometimes', 'nullable', 'string', 'max:50'],
            'expected_close_date' => ['sometimes', 'nullable', 'date'],
            'last_contacted_at' => ['sometimes', 'nullable', 'date'],
            'next_action_at' => ['sometimes', 'nullable', 'date'],
            'address' => ['sometimes', 'nullable', 'array'],
            'metadata' => ['sometimes', 'nullable', 'array'],
            'status_comment' => ['sometimes', 'nullable', 'string', 'max:500'],
            'products' => ['sometimes', 'array'],
            'products.*.product_id' => ['required_with:products', 'exists:products,id'],
            'products.*.quantity' => ['nullable', 'integer', 'min:1'],
            'products.*.price' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
