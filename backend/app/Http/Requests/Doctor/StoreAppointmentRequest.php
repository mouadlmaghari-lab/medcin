<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id'     => ['nullable', 'exists:patients,id'],
            'patient_name'   => ['nullable', 'string', 'max:50'],
            'telephone'      => ['nullable', 'string', 'max:50'],
            'debut'          => ['required', 'date', 'after_or_equal:now'],
            'fin'            => ['required', 'date', 'after:debut'],
            'etat'           => ['sometimes', 'string', 'in:en_attente,confirme,en_cours,termine,annule,absent'],
            'description'    => ['nullable', 'string', 'max:250'],
            'booking_source' => ['sometimes', 'in:web,mobile,walkin'],
        ];
    }

    public function messages(): array
    {
        return [
            'debut.required'       => 'La date/heure de début est obligatoire.',
            'debut.after_or_equal' => 'Le rendez-vous ne peut pas être dans le passé.',
            'fin.after'            => 'L\'heure de fin doit être après l\'heure de début.',
            'patient_id.exists'    => 'Ce patient n\'existe pas.',
        ];
    }
}
