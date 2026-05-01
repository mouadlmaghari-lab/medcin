<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'patient_id'      => $this->patient_id,
            'patient'         => new PatientListResource($this->whenLoaded('patient')),
            'consultation_id' => $this->consultation_id,
            'numero'          => $this->numero,
            'date_facture'    => $this->date_facture?->format('Y-m-d'),
            'statut'          => $this->statut,
            'montant_ht'      => $this->montant_ht,
            'tva'             => $this->tva,
            'montant_ttc'     => $this->montant_ttc,
            'pdf_path'        => $this->pdf_path,
            'notes'           => $this->notes,
            'items'           => InvoiceItemResource::collection($this->whenLoaded('items')),
            'payments'        => PaymentResource::collection($this->whenLoaded('payments')),
            'created_at'      => $this->created_at?->toISOString(),
        ];
    }
}
