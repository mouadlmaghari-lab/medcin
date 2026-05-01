<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'cin'              => $this->cin,
            'nom_complet'      => $this->nom_complet,
            'date_naissance'   => $this->date_naissance?->format('Y-m-d'),
            'lieu_naissance'   => $this->lieu_naissance,
            'ville'            => $this->ville,
            'profession'       => $this->profession,
            'date_inscription' => $this->date_inscription?->format('Y-m-d'),
            'genre'            => $this->genre,
            'telephone'        => $this->telephone,
            'adresse'          => $this->adresse,
            'email'            => $this->email,
            'type_couverture'  => $this->type_couverture,
            'observation'      => $this->observation,
            'numero_dossier'   => $this->numero_dossier,
            'type'             => $this->type,
            'active'           => $this->active,
            'photo_url'        => $this->when($this->relationLoaded('media'),
                fn () => $this->getFirstMediaUrl('photo')
            ),
            'created_at'       => $this->created_at?->toISOString(),
            'updated_at'       => $this->updated_at?->toISOString(),
        ];
    }
}
