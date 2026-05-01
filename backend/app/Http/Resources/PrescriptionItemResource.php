<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrescriptionItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'medication_id'   => $this->medication_id,
            'medication_name' => $this->medication_name,
            'dosage'          => $this->dosage,
            'frequence'       => $this->frequence,
            'duree'           => $this->duree,
            'instructions'    => $this->instructions,
            'ordre'           => $this->ordre,
        ];
    }
}
