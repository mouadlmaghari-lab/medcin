<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsultationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Parse stored "120/80" string back into separate integers for the frontend.
        [$sys, $dia] = $this->parseTension($this->tension_arterielle);

        return [
            'id'                     => $this->id,
            'patient_id'             => $this->patient_id,
            'patient'                => new PatientListResource($this->whenLoaded('patient')),
            'appointment_id'         => $this->appointment_id,
            'date_consultation'      => $this->date_consultation?->format('Y-m-d'),

            // ── Vitals ────────────────────────────────────────────────────────
            'poids'                  => $this->poids,
            'taille'                 => $this->taille,
            'temperature'            => $this->temperature,
            'tension_systolique'     => $sys,
            'tension_diastolique'    => $dia,
            'saturation_o2'          => $this->saturation_o2,
            'frequence_cardiaque'    => $this->frequence_cardiaque,
            'frequence_respiratoire' => $this->frequence_respiratoire,

            // ── Diabetology labs ──────────────────────────────────────────────
            'glycemie'               => $this->glycemie,
            'glycemie_a_jeun'        => $this->glycemie_a_jeun,
            'glycemie_apres_repas'   => $this->glycemie_apres_repas,
            'hba1c'                  => $this->hba1c,
            'glucagon'               => $this->glucagon,
            'tt'                     => $this->tt,
            'th'                     => $this->th,
            'glogylie'               => $this->glogylie,
            'glucosurie'             => $this->glucosurie,
            'acetone'                => $this->acetone,

            // ── Lipid panel ───────────────────────────────────────────────────
            'cholesterol_total'      => $this->cholesterol_total,
            'triglycerides'          => $this->triglycerides,
            'hdl'                    => $this->hdl,
            'ldl'                    => $this->ldl,

            // ── Clinical notes ────────────────────────────────────────────────
            'examen_clinique'        => $this->examen_clinique,
            'diagnostic'             => $this->diagnostic,
            'conduite_a_tenir'       => $this->conduite_a_tenir,

            // ── Payment ───────────────────────────────────────────────────────
            'prix'                   => $this->prix,
            'regle'                  => $this->regle,

            // ── Relations ─────────────────────────────────────────────────────
            'payments'               => PaymentResource::collection($this->whenLoaded('payments')),
            'prescriptions'          => PrescriptionResource::collection($this->whenLoaded('prescriptions')),
            'created_at'             => $this->created_at?->toISOString(),
            'updated_at'             => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Parse "120/80" → [120, 80]. Returns [null, null] if absent or malformed.
     *
     * @return array{int|null, int|null}
     */
    private function parseTension(?string $tension): array
    {
        if ($tension === null || $tension === '') {
            return [null, null];
        }

        $parts = explode('/', $tension, 2);

        return [
            isset($parts[0]) && $parts[0] !== '' ? (int) $parts[0] : null,
            isset($parts[1]) && $parts[1] !== '' ? (int) $parts[1] : null,
        ];
    }
}
