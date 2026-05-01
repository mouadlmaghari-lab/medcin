<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = auth()->user()->effectiveTenantId();

        return [
            'cin'              => ['nullable', 'string', 'max:20'],
            'nom_complet'      => ['required', 'string', 'max:100'],
            'date_naissance'   => ['nullable', 'date', 'before:today'],
            'lieu_naissance'   => ['nullable', 'string', 'max:50'],
            'ville'            => ['nullable', 'string', 'max:50'],
            'profession'       => ['nullable', 'string', 'max:50'],
            'genre'            => ['nullable', 'string', 'in:Homme,Femme,Autre'],
            'telephone'        => ['required', 'string', 'max:50'],
            'adresse'          => ['nullable', 'string', 'max:250'],
            'email'            => ['nullable', 'email', 'max:100'],
            'type_couverture'  => ['nullable', 'string', 'max:20'],
            'observation'      => ['nullable', 'string'],
            'type_dossier'     => ['nullable', 'string', 'max:50'],
            'id_dossier'       => ['nullable', 'string', 'max:20'],
            'type'             => ['sometimes', 'in:digital,physical'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom_complet.required' => 'Le nom complet du patient est obligatoire.',
            'telephone.required'   => 'Le numéro de téléphone est obligatoire.',
            'date_naissance.before' => 'La date de naissance doit être antérieure à aujourd\'hui.',
            'genre.in'             => 'Le genre doit être Homme, Femme ou Autre.',
        ];
    }
}
