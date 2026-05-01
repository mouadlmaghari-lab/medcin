<?php

namespace App\Http\Controllers\Api\V1\Assistant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaymentController extends Controller
{
    /**
     * List payments (Assistant can manage payments/settlements).
     * GET /api/v1/assistant/payments?patient_id=&consultation_id=&methode_paiement=&date_from=&date_to=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Payment::query()
            ->with('patient:id,nom_complet,telephone,numero_dossier')
            ->when($request->patient_id, fn ($q, $id) => $q->where('patient_id', $id))
            ->when($request->consultation_id, fn ($q, $id) => $q->where('consultation_id', $id))
            ->when($request->methode_paiement, fn ($q, $m) => $q->where('methode_paiement', $m))
            ->when($request->date_from, fn ($q, $d) => $q->where('date_paiement', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->where('date_paiement', '<=', $d))
            ->latest('date_paiement');

        return PaymentResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    /**
     * Create payment (record settlement).
     */
    public function store(StorePaymentRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Auto-generate receipt number: REC-YYYY-XXXX
        $year = now()->year;
        $tenantId = auth()->user()->effectiveTenantId();
        $count = Payment::withoutGlobalScopes()
            ->where('tenant_id', $tenantId)
            ->whereYear('date_paiement', $year)
            ->count();
        $data['numero_recu'] = 'REC-' . $year . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);
        $data['enregistre_par'] = auth()->user()->nom_complet;

        $payment = Payment::create($data);

        // Update consultation paid status if fully paid
        if ($payment->reste_a_payer <= 0) {
            $payment->consultation?->update(['regle' => true]);
        }

        return (new PaymentResource($payment->load('patient')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show payment details.
     */
    public function show(Payment $payment): PaymentResource
    {
        $payment->load(['patient']);

        return new PaymentResource($payment);
    }

    /**
     * Update payment is restricted for assistant.
     */
    public function update(Request $request, Payment $payment): JsonResponse
    {
        return response()->json([
            'message' => 'Les paiements enregistrés ne peuvent pas être modifiés.',
        ], 403);
    }

    /**
     * Delete payment (only if not yet processed).
     */
    public function destroy(Payment $payment): JsonResponse
    {
        if ($payment->statut === 'processé') {
            return response()->json([
                'message' => 'Les paiements traités ne peuvent pas être supprimés.',
            ], 403);
        }

        $payment->delete();

        return response()->json(['message' => 'Paiement supprimé.']);
    }
}
