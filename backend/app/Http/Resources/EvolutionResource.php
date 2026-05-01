<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvolutionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'patient_id'     => $this->patient_id,
            'date_evolution' => $this->date_evolution?->format('Y-m-d'),
            'note'           => $this->note,
            'type'           => $this->type,
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
