<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class StoreMedicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom'              => ['required', 'string', 'max:200'],
            'nom_generique'    => ['nullable', 'string', 'max:200'],
            'categorie'        => ['nullable', 'string', 'max:100'],
            'forme'            => ['nullable', 'string', 'max:50'],
            'unite'            => ['nullable', 'string', 'max:20'],
            'prix_achat'       => ['nullable', 'numeric', 'min:0'],
            'prix_vente'       => ['nullable', 'numeric', 'min:0'],
            'stock_qty'        => ['sometimes', 'integer', 'min:0'],
            'stock_alerte_min' => ['sometimes', 'integer', 'min:0'],
            'date_expiration'  => ['nullable', 'date', 'after:today'],
            'code_barre'       => ['nullable', 'string', 'max:50'],
            'notes'            => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required'            => 'Le nom du médicament est obligatoire.',
            'date_expiration.after'   => 'La date d\'expiration doit être dans le futur.',
        ];
    }
}
