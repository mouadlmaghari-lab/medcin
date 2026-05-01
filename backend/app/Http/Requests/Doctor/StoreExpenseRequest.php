<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id'   => ['nullable', 'exists:expense_categories,id'],
            'description'   => ['required', 'string', 'max:250'],
            'fournisseur'   => ['nullable', 'string', 'max:100'],
            'montant'       => ['required', 'numeric', 'min:0'],
            'date_depense'  => ['required', 'date'],
            'notes'         => ['nullable', 'string'],
            'receipt'       => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'description.required'  => 'La description est obligatoire.',
            'montant.required'      => 'Le montant est obligatoire.',
            'date_depense.required' => 'La date de la dépense est obligatoire.',
            'receipt.max'           => 'Le reçu ne doit pas dépasser 10 Mo.',
        ];
    }
}
