<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StoreMedicationRequest;
use App\Http\Resources\MedicationResource;
use App\Models\Medication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MedicationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Medication::query()
            ->when($request->search, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('nom_generique', 'like', "%{$search}%")
                      ->orWhere('code_barre', $search);
                });
            })
            ->when($request->categorie, fn ($q, $c) => $q->where('categorie', $c))
            ->when($request->boolean('low_stock'), fn ($q) => $q->lowStock())
            ->when($request->boolean('expired'), fn ($q) => $q->where('date_expiration', '<', now()))
            ->when($request->boolean('expiring_soon'), fn ($q) => $q->expiringSoon(30))
            ->when($request->has('active'), fn ($q) => $q->where('active', $request->boolean('active')))
            ->orderBy('nom');

        return MedicationResource::collection($query->paginate($request->integer('per_page', 50)));
    }

    public function store(StoreMedicationRequest $request): JsonResponse
    {
        $medication = Medication::create($request->validated());

        return (new MedicationResource($medication))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Medication $medication): MedicationResource
    {
        return new MedicationResource($medication);
    }

    public function update(StoreMedicationRequest $request, Medication $medication): MedicationResource
    {
        $medication->update($request->validated());

        return new MedicationResource($medication->fresh());
    }

    public function destroy(Medication $medication): JsonResponse
    {
        $medication->update(['active' => false]);

        return response()->json(['message' => 'Médicament désactivé.']);
    }
}
