<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'patient_id'      => $this->patient_id,
            'patient'         => new PatientListResource($this->whenLoaded('patient')),
            'created_by'      => $this->created_by,
            'patient_name'    => $this->patient_name,
            'telephone'       => $this->telephone,
            'debut'           => $this->debut?->toISOString(),
            'fin'             => $this->fin?->toISOString(),
            'etat'            => $this->etat,
            'description'     => $this->description,
            'booking_source'  => $this->booking_source,
            'created_at'      => $this->created_at?->toISOString(),
        ];
    }
}
