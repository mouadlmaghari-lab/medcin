<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

class UploadAnalysisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'doctor_ids'   => ['required', 'array', 'min:1'],
            'doctor_ids.*' => ['exists:users,id'],
            'file'         => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'description'  => ['nullable', 'string', 'max:250'],
        ];
    }

    public function messages(): array
    {
        return [
            'doctor_ids.required'  => 'Sélectionnez au moins un médecin.',
            'file.required'        => 'Le fichier d\'analyse est obligatoire.',
            'file.mimes'           => 'Le fichier doit être PDF, JPEG ou PNG.',
            'file.max'             => 'Le fichier ne doit pas dépasser 10 Mo.',
        ];
    }
}
