<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id'                 => ['required', 'exists:patients,id'],
            'consultation_id'            => ['nullable', 'exists:consultations,id'],
            'date_facture'               => ['required', 'date'],
            'tva'                        => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'notes'                      => ['nullable', 'string'],
            // Items
            'items'                      => ['required', 'array', 'min:1'],
            'items.*.description'        => ['required', 'string', 'max:255'],
            'items.*.quantity'           => ['required', 'integer', 'min:1'],
            'items.*.prix_unitaire'      => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id.required'             => 'Le patient est obligatoire.',
            'date_facture.required'           => 'La date de la facture est obligatoire.',
            'items.required'                  => 'Au moins une ligne de facture est requise.',
            'items.*.description.required'    => 'La description de la ligne est obligatoire.',
            'items.*.quantity.required'       => 'La quantité est obligatoire.',
            'items.*.prix_unitaire.required'  => 'Le prix unitaire est obligatoire.',
        ];
    }
}
