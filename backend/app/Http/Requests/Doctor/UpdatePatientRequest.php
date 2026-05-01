<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cin'              => ['nullable', 'string', 'max:20'],
            'nom_complet'      => ['sometimes', 'required', 'string', 'max:100'],
            'date_naissance'   => ['nullable', 'date', 'before:today'],
            'lieu_naissance'   => ['nullable', 'string', 'max:50'],
            'ville'            => ['nullable', 'string', 'max:50'],
            'profession'       => ['nullable', 'string', 'max:50'],
            'genre'            => ['nullable', 'string', 'in:Homme,Femme,Autre'],
            'telephone'        => ['sometimes', 'required', 'string', 'max:50'],
            'adresse'          => ['nullable', 'string', 'max:250'],
            'email'            => ['nullable', 'email', 'max:100'],
            'type_couverture'  => ['nullable', 'string', 'max:20'],
            'observation'      => ['nullable', 'string'],
            'active'           => ['sometimes', 'boolean'],
        ];
    }
}
