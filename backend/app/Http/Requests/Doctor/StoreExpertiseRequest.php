<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpertiseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id'      => ['required', 'exists:patients,id'],
            'titre'           => ['required', 'string', 'max:200'],
            'contenu'         => ['nullable', 'string'],
            'date_expertise'  => ['required', 'date'],
            'statut'          => ['sometimes', 'string', 'in:en_cours,termine'],
            'attachments'     => ['nullable', 'array'],
            'attachments.*'   => ['file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id.required'      => 'Le patient est obligatoire.',
            'titre.required'           => 'Le titre de l\'expertise est obligatoire.',
            'date_expertise.required'  => 'La date est obligatoire.',
            'attachments.*.max'        => 'Chaque fichier ne doit pas dépasser 10 Mo.',
        ];
    }
}
