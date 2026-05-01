<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Lightweight resource for patient lists / dropdowns */
class PatientListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'nom_complet'    => $this->nom_complet,
            'telephone'      => $this->telephone,
            'cin'            => $this->cin,
            'numero_dossier' => $this->numero_dossier,
            'genre'          => $this->genre,
            'type'           => $this->type,
            'active'         => $this->active,
        ];
    }
}
