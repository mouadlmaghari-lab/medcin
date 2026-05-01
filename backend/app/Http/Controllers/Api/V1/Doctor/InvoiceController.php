<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StoreInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Invoice::query()
            ->with(['patient:id,nom_complet,telephone,numero_dossier', 'items'])
            ->when($request->patient_id, fn ($q, $id) => $q->where('patient_id', $id))
            ->when($request->statut, fn ($q, $s) => $q->where('statut', $s))
            ->when($request->date_from, fn ($q, $d) => $q->where('date_facture', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->where('date_facture', '<=', $d))
            ->latest('date_facture');

        return InvoiceResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            $data = $request->validated();
            $items = $data['items'];
            unset($data['items']);

            // Auto-number: FACT-YYYY-XXXX per doctor per year
            $year = now()->year;
            $tenantId = auth()->user()->effectiveTenantId();
            $count = Invoice::withoutGlobalScopes()
                ->where('tenant_id', $tenantId)
                ->whereYear('date_facture', $year)
                ->count();
            $data['numero'] = 'FACT-' . $year . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);
            $data['statut'] = 'draft';

            // Calculate totals from items
            $montantHt = collect($items)->sum(fn ($i) => $i['quantity'] * $i['prix_unitaire']);
            $tvaRate = $data['tva'] ?? 0;
            $data['montant_ht'] = $montantHt;
            $data['montant_ttc'] = $montantHt + ($montantHt * $tvaRate / 100);

            $invoice = Invoice::create($data);

            foreach ($items as $item) {
                $item['montant'] = $item['quantity'] * $item['prix_unitaire'];
                $invoice->items()->create($item);
            }

            return (new InvoiceResource($invoice->load(['patient', 'items'])))
                ->response()
                ->setStatusCode(201);
        });
    }

    public function show(Invoice $invoice): InvoiceResource
    {
        $invoice->load(['patient', 'items', 'payments', 'consultation']);

        return new InvoiceResource($invoice);
    }

    public function update(StoreInvoiceRequest $request, Invoice $invoice): InvoiceResource
    {
        return DB::transaction(function () use ($request, $invoice) {
            $data = $request->validated();
            $items = $data['items'];
            unset($data['items']);

            // Recalculate totals
            $montantHt = collect($items)->sum(fn ($i) => $i['quantity'] * $i['prix_unitaire']);
            $tvaRate = $data['tva'] ?? $invoice->tva;
            $data['montant_ht'] = $montantHt;
            $data['montant_ttc'] = $montantHt + ($montantHt * $tvaRate / 100);

            $invoice->update($data);

            // Replace items
            $invoice->items()->delete();
            foreach ($items as $item) {
                $item['montant'] = $item['quantity'] * $item['prix_unitaire'];
                $invoice->items()->create($item);
            }

            return new InvoiceResource($invoice->fresh()->load(['patient', 'items']));
        });
    }

    public function destroy(Invoice $invoice): JsonResponse
    {
        $invoice->items()->delete();
        $invoice->delete();

        return response()->json(['message' => 'Facture supprimée.']);
    }
}
