<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id'   => ['nullable', 'exists:patients,id'],
            'patient_name' => ['nullable', 'string', 'max:50'],
            'telephone'    => ['nullable', 'string', 'max:50'],
            'debut'        => ['sometimes', 'date'],
            'fin'          => ['sometimes', 'date', 'after:debut'],
            'etat'         => ['sometimes', 'string', 'in:en_attente,confirme,en_cours,termine,annule,absent'],
            'description'  => ['nullable', 'string', 'max:250'],
        ];
    }
}
