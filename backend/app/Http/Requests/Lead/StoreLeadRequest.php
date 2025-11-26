<?php

namespace App\Http\Requests\Lead;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeadRequest extends FormRequest
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
            'first_name' => ['required_without:company_name', 'string', 'max:120'],
            'last_name' => ['nullable', 'string', 'max:120'],
            'company_name' => ['nullable', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'in:new,qualified,contacted,converted,lost'],
            'stage' => ['nullable', 'string', 'max:50'],
            'assigned_to_user_id' => ['nullable', 'exists:users,id'],
            'team_id' => ['nullable', 'exists:teams,id'],
            'source_id' => ['nullable', 'exists:lead_sources,id'],
            'territory_code' => ['nullable', 'string', 'max:25'],
            'potential_value' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'lifecycle_stage' => ['nullable', 'string', 'max:50'],
            'expected_close_date' => ['nullable', 'date'],
            'last_contacted_at' => ['nullable', 'date'],
            'next_action_at' => ['nullable', 'date'],
            'address' => ['nullable', 'array'],
            'metadata' => ['nullable', 'array'],
            'status_comment' => ['nullable', 'string', 'max:500'],
            'products' => ['sometimes', 'array'],
            'products.*.product_id' => ['required_with:products', 'exists:products,id'],
            'products.*.quantity' => ['nullable', 'integer', 'min:1'],
            'products.*.price' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
