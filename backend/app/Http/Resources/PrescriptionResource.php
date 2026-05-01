<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrescriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'patient_id'       => $this->patient_id,
            'patient'          => new PatientListResource($this->whenLoaded('patient')),
            'consultation_id'  => $this->consultation_id,
            'date_ordonnance'  => $this->date_ordonnance?->format('Y-m-d'),
            'notes'            => $this->notes,
            'numero'           => $this->numero,
            'is_template'      => $this->is_template,
            'template_name'    => $this->template_name,
            'pdf_path'         => $this->pdf_path,
            'items'            => PrescriptionItemResource::collection($this->whenLoaded('items')),
            'created_at'       => $this->created_at?->toISOString(),
        ];
    }
}
