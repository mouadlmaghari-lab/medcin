<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'nom'             => $this->nom,
            'nom_generique'   => $this->nom_generique,
            'categorie'       => $this->categorie,
            'forme'           => $this->forme,
            'unite'           => $this->unite,
            'prix_achat'      => $this->prix_achat,
            'prix_vente'      => $this->prix_vente,
            'stock_qty'       => $this->stock_qty,
            'stock_alerte_min' => $this->stock_alerte_min,
            'is_low_stock'    => $this->isLowStock(),
            'date_expiration' => $this->date_expiration?->format('Y-m-d'),
            'is_expired'      => $this->isExpired(),
            'code_barre'      => $this->code_barre,
            'notes'           => $this->notes,
            'active'          => $this->active,
            'created_at'      => $this->created_at?->toISOString(),
        ];
    }
}
