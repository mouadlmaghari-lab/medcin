<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StorePatientRequest;
use App\Http\Requests\Doctor\UpdatePatientRequest;
use App\Http\Resources\PatientListResource;
use App\Http\Resources\PatientResource;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PatientController extends Controller
{
    /**
     * List patients with search + pagination.
     * GET /api/v1/doctor/patients?search=&per_page=&page=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Patient::query()
            ->when($request->search, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('nom_complet', 'like', "%{$search}%")
                      ->orWhere('telephone', 'like', "%{$search}%")
                      ->orWhere('cin', 'like', "%{$search}%")
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
     * Create a new patient with auto-generated DR-XXXX number.
     */
    public function store(StorePatientRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['date_inscription'] = now();

        // Auto-generate DR-XXXX per doctor
        $lastNumber = Patient::withoutGlobalScopes()
            ->where('tenant_id', auth()->user()->effectiveTenantId())
            ->max('id') ?? 0;
        $data['numero_dossier'] = 'DR-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

        $patient = Patient::create($data);

        // Handle photo upload via Spatie Medialibrary
        if ($request->hasFile('photo')) {
            $patient->addMediaFromRequest('photo')
                ->toMediaCollection('photo');
        }

        return (new PatientResource($patient))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show a patient with full details.
     */
    public function show(Patient $patient): PatientResource
    {
        $patient->load(['media']);

        return new PatientResource($patient);
    }

    /**
     * Update patient info.
     */
    public function update(UpdatePatientRequest $request, Patient $patient): PatientResource
    {
        $patient->update($request->validated());

        if ($request->hasFile('photo')) {
            $patient->clearMediaCollection('photo');
            $patient->addMediaFromRequest('photo')
                ->toMediaCollection('photo');
        }

        return new PatientResource($patient->fresh());
    }

    /**
     * Soft-delete a patient.
     */
    public function destroy(Patient $patient): JsonResponse
    {
        $patient->delete();

        return response()->json(['message' => 'Patient supprimé.']);
    }

    /**
     * Get full medical history for a patient (consultations + appointments).
     */
    public function history(Patient $patient): JsonResponse
    {
        $patient->load([
            'consultations' => fn ($q) => $q->latest('date_consultation'),
            'appointments'  => fn ($q) => $q->latest('debut'),
            'certificates'  => fn ($q) => $q->latest('date_certificat'),
            'prescriptions' => fn ($q) => $q->latest('date_ordonnance'),
            'payments'      => fn ($q) => $q->latest('date_paiement'),
        ]);

        return response()->json([
            'patient'        => new PatientResource($patient),
            'consultations'  => $patient->consultations,
            'appointments'   => $patient->appointments,
            'certificates'   => $patient->certificates,
            'prescriptions'  => $patient->prescriptions,
            'payments'       => $patient->payments,
        ]);
    }
}
