<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'description'    => $this->description,
            'quantity'       => $this->quantity,
            'prix_unitaire'  => $this->prix_unitaire,
            'montant'        => $this->montant,
        ];
    }
}
