<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicalReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'patient_id'      => $this->patient_id,
            'patient'         => new PatientListResource($this->whenLoaded('patient')),
            'titre'           => $this->titre,
            'contenu'         => $this->contenu,
            'date_rapport'    => $this->date_rapport?->format('Y-m-d'),
            'partage_patient' => $this->partage_patient,
            'pdf_path'        => $this->pdf_path,
            'created_at'      => $this->created_at?->toISOString(),
        ];
    }
}
