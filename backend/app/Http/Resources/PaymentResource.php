<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'consultation_id'     => $this->consultation_id,
            'patient_id'          => $this->patient_id,
            'patient'             => new PatientListResource($this->whenLoaded('patient')),
            'invoice_id'          => $this->invoice_id,
            'date_paiement'       => $this->date_paiement?->format('Y-m-d'),
            'somme'               => $this->somme,
            'description'         => $this->description,
            'lettre'              => $this->lettre,
            'methode_paiement'    => $this->methode_paiement,
            'reste_a_payer'       => $this->reste_a_payer,
            'reference_assurance' => $this->reference_assurance,
            'numero_recu'         => $this->numero_recu,
            'created_at'          => $this->created_at?->toISOString(),
        ];
    }
}
