<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'consultation_id'       => ['required', 'exists:consultations,id'],
            'patient_id'            => ['required', 'exists:patients,id'],
            'invoice_id'            => ['nullable', 'exists:invoices,id'],
            'date_paiement'         => ['required', 'date'],
            'somme'                 => ['required', 'numeric', 'min:0'],
            'description'           => ['nullable', 'string'],
            'lettre'                => ['nullable', 'string', 'max:150'],
            'methode_paiement'      => ['sometimes', 'string', 'in:espece,carte,assurance'],
            'reste_a_payer'         => ['nullable', 'numeric', 'min:0'],
            'reference_assurance'   => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'consultation_id.required' => 'La consultation est obligatoire.',
            'patient_id.required'      => 'Le patient est obligatoire.',
            'date_paiement.required'   => 'La date de paiement est obligatoire.',
            'somme.required'           => 'Le montant est obligatoire.',
            'somme.min'                => 'Le montant doit être positif.',
        ];
    }
}
