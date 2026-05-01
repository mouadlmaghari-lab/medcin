<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class StorePrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id'                  => ['required', 'exists:patients,id'],
            'consultation_id'             => ['nullable', 'exists:consultations,id'],
            'date_ordonnance'             => ['required', 'date'],
            'notes'                       => ['nullable', 'string'],
            'is_template'                 => ['sometimes', 'boolean'],
            'template_name'               => ['required_if:is_template,true', 'nullable', 'string', 'max:200'],
            // Items array
            'items'                       => ['required', 'array', 'min:1'],
            'items.*.medication_name'     => ['required', 'string', 'max:200'],
            'items.*.medication_id'       => ['nullable', 'exists:medications,id'],
            'items.*.dosage'              => ['nullable', 'string', 'max:100'],
            'items.*.frequence'           => ['nullable', 'string', 'max:100'],
            'items.*.duree'               => ['nullable', 'string', 'max:100'],
            'items.*.instructions'        => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id.required'                => 'Le patient est obligatoire.',
            'date_ordonnance.required'           => 'La date de l\'ordonnance est obligatoire.',
            'items.required'                     => 'Au moins un médicament est requis.',
            'items.min'                          => 'Au moins un médicament est requis.',
            'items.*.medication_name.required'   => 'Le nom du médicament est obligatoire.',
            'template_name.required_if'          => 'Le nom du modèle est obligatoire pour un template.',
        ];
    }
}
