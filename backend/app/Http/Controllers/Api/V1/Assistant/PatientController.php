<?php

namespace App\Http\Controllers\Api\V1\Assistant;

use App\Http\Controllers\Controller;
use App\Http\Resources\PatientListResource;
use App\Http\Resources\PatientResource;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PatientController extends Controller
{
    /**
     * List patients with search + pagination (read-only for assistant).
     * GET /api/v1/assistant/patients?search=&per_page=&page=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Patient::query()
            ->when($request->search, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('nom_complet', 'like', "%{$search}%")
                      ->orWhere('telephone', 'like', "%{$search}%")
                      ->orWhere('numero_dossier', 'like', "%{$search}%");
                });
            })
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->when($request->has('active'), fn ($q) => $q->where('active', $request->boolean('active')))
            ->latest();

        $perPage = min($request->integer('per_page', 20), 100);

        return PatientListResource::collection($query->paginate($perPage));
    }

    /**
     * Show patient details (read-only).
     */
    public function show(Patient $patient): PatientResource
    {
        $patient->load(['media']);

        return new PatientResource($patient);
    }

    /**
     * Assistants cannot create or update patients (restricted operation).
     */
    public function store(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'L\'assistant n\'a pas les droits pour créer des patients.',
        ], 403);
    }

    /**
     * Assistants cannot create or update patients (restricted operation).
     */
    public function update(Request $request, Patient $patient): JsonResponse
    {
        return response()->json([
            'message' => 'L\'assistant n\'a pas les droits pour modifier les patients.',
        ], 403);
    }

    /**
     * Assistants cannot delete patients (restricted operation).
     */
    public function destroy(Patient $patient): JsonResponse
    {
        return response()->json([
            'message' => 'L\'assistant n\'a pas les droits pour supprimer des patients.',
        ], 403);
    }
}
