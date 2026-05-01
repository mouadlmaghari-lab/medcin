<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StorePrescriptionRequest;
use App\Http\Resources\PrescriptionResource;
use App\Models\Prescription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class PrescriptionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Prescription::query()
            ->with(['patient:id,nom_complet,telephone,numero_dossier', 'items'])
            ->when($request->patient_id, fn ($q, $id) => $q->where('patient_id', $id))
            ->when($request->boolean('templates_only'), fn ($q) => $q->templates())
            ->latest('date_ordonnance');

        return PrescriptionResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    public function store(StorePrescriptionRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            $data = $request->validated();
            $items = $data['items'];
            unset($data['items']);

            // Auto-number: ORD-YYYY-XXXX per doctor (skip for templates)
            if (empty($data['is_template'])) {
                $year = now()->year;
                $tenantId = auth()->user()->effectiveTenantId();
                $count = Prescription::withoutGlobalScopes()
                    ->where('tenant_id', $tenantId)
                    ->where('is_template', false)
                    ->whereYear('date_ordonnance', $year)
                    ->count();
                $data['numero'] = 'ORD-' . $year . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);
            }

            $prescription = Prescription::create($data);

            foreach ($items as $index => $item) {
                $item['ordre'] = $index;
                $prescription->items()->create($item);
            }

            return (new PrescriptionResource($prescription->load(['patient', 'items'])))
                ->response()
                ->setStatusCode(201);
        });
    }

    public function show(Prescription $prescription): PrescriptionResource
    {
        $prescription->load(['patient', 'items', 'consultation']);

        return new PrescriptionResource($prescription);
    }

    public function update(StorePrescriptionRequest $request, Prescription $prescription): PrescriptionResource
    {
        return DB::transaction(function () use ($request, $prescription) {
            $data = $request->validated();
            $items = $data['items'];
            unset($data['items']);

            $prescription->update($data);

            // Replace all items
            $prescription->items()->delete();
            foreach ($items as $index => $item) {
                $item['ordre'] = $index;
                $prescription->items()->create($item);
            }

            return new PrescriptionResource($prescription->fresh()->load(['patient', 'items']));
        });
    }

    public function destroy(Prescription $prescription): JsonResponse
    {
        $prescription->items()->delete();
        $prescription->delete();

        return response()->json(['message' => 'Ordonnance supprimée.']);
    }
}
