<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'category_id'  => $this->category_id,
            'category'     => $this->whenLoaded('category', fn () => [
                'id'      => $this->category->id,
                'nom'     => $this->category->nom,
                'couleur' => $this->category->couleur,
            ]),
            'description'  => $this->description,
            'fournisseur'  => $this->fournisseur,
            'montant'      => $this->montant,
            'date_depense' => $this->date_depense?->format('Y-m-d'),
            'notes'        => $this->notes,
            'receipt_path' => $this->receipt_path,
            'created_at'   => $this->created_at?->toISOString(),
        ];
    }
}
