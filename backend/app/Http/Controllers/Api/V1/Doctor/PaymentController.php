<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaymentController extends Controller
{
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

        $payment = Payment::create($data);

        // Update consultation paid status if fully paid
        if ($payment->reste_a_payer <= 0) {
            $payment->consultation?->update(['regle' => true]);
        }

        return (new PaymentResource($payment->load('patient')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Payment $payment): PaymentResource
    {
        $payment->load(['patient', 'consultation', 'invoice']);

        return new PaymentResource($payment);
    }

    public function update(StorePaymentRequest $request, Payment $payment): PaymentResource
    {
        $payment->update($request->validated());

        return new PaymentResource($payment->fresh()->load('patient'));
    }

    public function destroy(Payment $payment): JsonResponse
    {
        // Revert consultation paid status
        $payment->consultation?->update(['regle' => false]);
        $payment->delete();

        return response()->json(['message' => 'Règlement supprimé.']);
    }
}
