<?php

namespace App\Http\Resources;

use App\Enums\CertificateType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'numero'          => $this->numero,
            'patient_id'      => $this->patient_id,
            'consultation_id' => $this->consultation_id,
            'patient'         => new PatientListResource($this->whenLoaded('patient')),
            'type'            => $this->type instanceof CertificateType ? $this->type->value : $this->type,
            'date_certificat' => $this->date_certificat?->format('Y-m-d'),
            'date_debut'      => $this->date_debut?->format('Y-m-d'),
            'date_fin'        => $this->date_fin?->format('Y-m-d'),
            'nombre_jours'    => $this->nombre_jours,
            'contenu'         => $this->contenu,
            'urgence'         => $this->urgence,
            'pdf_path'        => $this->pdf_path,
            'created_at'      => $this->created_at?->toISOString(),
        ];
    }
}
