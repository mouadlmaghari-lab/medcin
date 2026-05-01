<?php

namespace App\Http\Requests\Doctor;

use App\Enums\CertificateType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreCertificateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id'      => ['required', 'integer', 'exists:patients,id'],
            'consultation_id' => ['nullable', 'integer', 'exists:consultations,id'],
            'date_certificat' => ['required', 'date'],
            'type'            => ['required', new Enum(CertificateType::class)],
            'date_debut'      => ['nullable', 'date'],
            'date_fin'        => ['nullable', 'date', 'after_or_equal:date_debut'],
            'nombre_jours'    => ['nullable', 'integer', 'min:1'],
            'contenu'         => ['nullable', 'string'],
            'urgence'         => ['nullable', 'string', 'max:150'],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id.required'      => 'Le patient est obligatoire.',
            'patient_id.exists'        => 'Le patient sélectionné est introuvable.',
            'consultation_id.exists'   => 'La consultation sélectionnée est introuvable.',
            'date_certificat.required' => 'La date du certificat est obligatoire.',
            'type.required'            => 'Le type de certificat est obligatoire.',
            'type.Illuminate\Validation\Rules\Enum' => 'Le type de certificat est invalide.',
            'date_fin.after_or_equal'  => 'La date de fin doit être après la date de début.',
            'nombre_jours.min'         => 'La durée doit être d\'au moins 1 jour.',
        ];
    }
}
