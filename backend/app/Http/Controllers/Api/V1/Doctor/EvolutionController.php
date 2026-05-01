<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StoreEvolutionRequest;
use App\Http\Resources\EvolutionResource;
use App\Models\Evolution;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EvolutionController extends Controller
{
    /**
     * List evolutions for a patient.
     * GET /api/v1/doctor/evolutions?patient_id=&date_from=&date_to=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Evolution::query()
            ->with('patient:id,nom_complet,numero_dossier')
            ->when($request->patient_id, fn ($q, $id) => $q->where('patient_id', $id))
            ->when($request->date_from, fn ($q, $d) => $q->where('date_evolution', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->where('date_evolution', '<=', $d))
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->latest('date_evolution');

        $perPage = min($request->integer('per_page', 20), 100);

        return EvolutionResource::collection($query->paginate($perPage));
    }

    /**
     * Create evolution note.
     */
    public function store(StoreEvolutionRequest $request): JsonResponse
    {
        $data = $request->validated();

        $evolution = Evolution::create($data);

        return (new EvolutionResource($evolution->load('patient')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show evolution note.
     */
    public function show(Evolution $evolution): EvolutionResource
    {
        $evolution->load('patient');

        return new EvolutionResource($evolution);
    }

    /**
     * Update evolution note.
     */
    public function update(StoreEvolutionRequest $request, Evolution $evolution): EvolutionResource
    {
        $evolution->update($request->validated());

        return new EvolutionResource($evolution->fresh()->load('patient'));
    }

    /**
     * Delete evolution note.
     */
    public function destroy(Evolution $evolution): JsonResponse
    {
        $evolution->delete();

        return response()->json(['message' => 'Note d\'évolution supprimée.']);
    }
}
