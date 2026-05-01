<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpertiseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'patient_id'     => $this->patient_id,
            'patient'        => new PatientListResource($this->whenLoaded('patient')),
            'titre'          => $this->titre,
            'contenu'        => $this->contenu,
            'date_expertise' => $this->date_expertise?->format('Y-m-d'),
            'statut'         => $this->statut,
            'pdf_path'       => $this->pdf_path,
            'attachments'    => $this->whenLoaded('attachments', fn () =>
                $this->attachments->map(fn ($a) => [
                    'id'         => $a->id,
                    'file_name'  => $a->file_name,
                    'media_type' => $a->media_type,
                    'file_size'  => $a->file_size,
                ])
            ),
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
