<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvolutionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id'      => ['required', 'exists:patients,id'],
            'date_evolution'  => ['required', 'date'],
            'note'            => ['required', 'string'],
            'type'            => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id.required'      => 'Le patient est obligatoire.',
            'date_evolution.required'  => 'La date est obligatoire.',
            'note.required'            => 'La note d\'évolution est obligatoire.',
        ];
    }
}
