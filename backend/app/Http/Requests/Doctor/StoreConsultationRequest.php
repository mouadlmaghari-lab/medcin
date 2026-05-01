<?php

namespace App\Http\Requests\Doctor;

use Illuminate\Foundation\Http\FormRequest;

class StoreConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // ── Core ────────────────────────────────────────────────────────────
            'patient_id'              => ['required', 'exists:patients,id'],
            'appointment_id'          => ['nullable', 'exists:appointments,id'],
            'date_consultation'       => ['required', 'date'],

            // ── Vitals ──────────────────────────────────────────────────────────
            'poids'                   => ['nullable', 'numeric', 'min:0', 'max:500'],
            'taille'                  => ['nullable', 'integer', 'min:0', 'max:300'],
            'temperature'             => ['nullable', 'numeric', 'min:30', 'max:45'],
            'tension_systolique'      => ['nullable', 'integer', 'min:0', 'max:300'],
            'tension_diastolique'     => ['nullable', 'integer', 'min:0', 'max:200'],
            'saturation_o2'           => ['nullable', 'numeric', 'min:0', 'max:100'],
            'frequence_cardiaque'     => ['nullable', 'integer', 'min:0', 'max:300'],
            'frequence_respiratoire'  => ['nullable', 'integer', 'min:0', 'max:60'],

            // ── Diabetology labs ────────────────────────────────────────────────
            'glycemie'                => ['nullable', 'numeric', 'min:0'],
            'glycemie_a_jeun'         => ['nullable', 'numeric', 'min:0'],
            'glycemie_apres_repas'    => ['nullable', 'numeric', 'min:0'],
            'hba1c'                   => ['nullable', 'numeric', 'min:0', 'max:20'],
            'glucagon'                => ['nullable', 'numeric', 'min:0'],
            'tt'                      => ['nullable', 'numeric'],
            'th'                      => ['nullable', 'numeric'],
            'glogylie'                => ['nullable', 'string', 'max:500'],
            'glucosurie'              => ['nullable', 'string', 'max:5'],
            'acetone'                 => ['nullable', 'string', 'max:5'],

            // ── Lipid panel ─────────────────────────────────────────────────────
            'cholesterol_total'       => ['nullable', 'numeric', 'min:0'],
            'triglycerides'           => ['nullable', 'numeric', 'min:0'],
            'hdl'                     => ['nullable', 'numeric', 'min:0'],
            'ldl'                     => ['nullable', 'numeric', 'min:0'],

            // ── Clinical notes ──────────────────────────────────────────────────
            'examen_clinique'         => ['nullable', 'string'],
            'diagnostic'              => ['nullable', 'string'],
            'conduite_a_tenir'        => ['nullable', 'string'],

            // ── Payment ─────────────────────────────────────────────────────────
            'prix'                    => ['nullable', 'numeric', 'min:0'],
            'regle'                   => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'patient_id.required'           => 'Le patient est obligatoire.',
            'patient_id.exists'             => "Ce patient n'existe pas.",
            'date_consultation.required'    => 'La date de consultation est obligatoire.',
            'poids.max'                     => 'Le poids ne peut pas dépasser 500 kg.',
            'temperature.min'               => 'La température doit être au minimum 30°C.',
            'temperature.max'               => 'La température ne peut pas dépasser 45°C.',
            'tension_systolique.max'        => 'La tension systolique ne peut pas dépasser 300 mmHg.',
            'tension_diastolique.max'       => 'La tension diastolique ne peut pas dépasser 200 mmHg.',
            'saturation_o2.max'             => 'La saturation O2 ne peut pas dépasser 100%.',
            'hba1c.max'                     => "L'HbA1c ne peut pas dépasser 20%.",
        ];
    }
}
