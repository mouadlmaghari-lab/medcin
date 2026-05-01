<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class StoreMedicalReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id'       => ['required', 'exists:patients,id'],
            'titre'            => ['required', 'string', 'max:200'],
            'contenu'          => ['required', 'string'],
            'date_rapport'     => ['required', 'date'],
            'partage_patient'  => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id.required'   => 'Le patient est obligatoire.',
            'titre.required'        => 'Le titre du rapport est obligatoire.',
            'contenu.required'      => 'Le contenu du rapport est obligatoire.',
            'date_rapport.required' => 'La date du rapport est obligatoire.',
        ];
    }
}
