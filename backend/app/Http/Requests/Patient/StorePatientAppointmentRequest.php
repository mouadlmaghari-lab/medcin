<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'doctor_id'    => ['required', 'exists:users,id'],
            'debut'        => ['required', 'date', 'after:now'],
            'fin'          => ['required', 'date', 'after:debut'],
            'description'  => ['nullable', 'string', 'max:250'],
        ];
    }

    public function messages(): array
    {
        return [
            'doctor_id.required' => 'Le médecin est obligatoire.',
            'doctor_id.exists'   => 'Ce médecin n\'existe pas.',
            'debut.required'     => 'La date/heure est obligatoire.',
            'debut.after'        => 'Le rendez-vous doit être dans le futur.',
            'fin.after'          => 'L\'heure de fin doit être après le début.',
        ];
    }
}
