<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StoreConsultationRequest;
use App\Http\Resources\ConsultationResource;
use App\Models\Consultation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ConsultationController extends Controller
{
    /**
     * List consultations with filters.
     * GET /api/v1/doctor/consultations?patient_id=&date_from=&date_to=&per_page=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Consultation::query()
            ->with('patient:id,nom_complet,telephone,numero_dossier')
            ->when($request->patient_id, fn ($q, $id) => $q->where('patient_id', $id))
            ->when($request->date_from, fn ($q, $d) => $q->where('date_consultation', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->where('date_consultation', '<=', $d))
            ->when($request->regle !== null, fn ($q) => $q->where('regle', $request->boolean('regle')))
            ->latest('date_consultation');

        $perPage = min($request->integer('per_page', 20), 100);

        return ConsultationResource::collection($query->paginate($perPage));
    }

    /**
     * Create a new consultation.
     * Accepts tension_systolique + tension_diastolique and combines into tension_arterielle.
     */
    public function store(StoreConsultationRequest $request): JsonResponse
    {
        $consultation = Consultation::create($this->prepareData($request->validated()));

        if ($consultation->appointment_id) {
            $consultation->appointment?->update(['etat' => 'termine']);
        }

        return (new ConsultationResource($consultation->load('patient')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show a single consultation with related data.
     */
    public function show(Consultation $consultation): ConsultationResource
    {
        $consultation->load(['patient', 'appointment', 'payments', 'prescriptions.items']);

        return new ConsultationResource($consultation);
    }

    /**
     * Update consultation fields.
     */
    public function update(StoreConsultationRequest $request, Consultation $consultation): ConsultationResource
    {
        $consultation->update($this->prepareData($request->validated()));

        return new ConsultationResource($consultation->fresh()->load('patient'));
    }

    /**
     * Soft-delete a consultation.
     */
    public function destroy(Consultation $consultation): JsonResponse
    {
        $consultation->delete();

        return response()->json(['message' => 'Consultation supprimée.']);
    }

    /**
     * Get all consultations for a specific patient.
     * GET /api/v1/doctor/patients/{patientId}/consultations
     */
    public function byPatient(string $patientId): AnonymousResourceCollection
    {
        $consultations = Consultation::where('patient_id', $patientId)
            ->with('payments')
            ->latest('date_consultation')
            ->paginate(20);

        return ConsultationResource::collection($consultations);
    }

    /**
     * Return the canonical validation rules for the consultation form.
     * Frontend uses this to keep its Zod schema in sync with backend constraints.
     *
     * GET /api/v1/doctor/consultations/validation-rules
     */
    public function validationRules(): JsonResponse
    {
        return response()->json([
            'data' => [
                // Core
                'patient_id'              => ['type' => 'integer',  'required' => true],
                'appointment_id'          => ['type' => 'integer',  'required' => false],
                'date_consultation'       => ['type' => 'date',     'required' => true],
                // Vitals
                'poids'                   => ['type' => 'number',   'required' => false, 'min' => 0,  'max' => 500],
                'taille'                  => ['type' => 'integer',  'required' => false, 'min' => 0,  'max' => 300],
                'temperature'             => ['type' => 'number',   'required' => false, 'min' => 30, 'max' => 45],
                'tension_systolique'      => ['type' => 'integer',  'required' => false, 'min' => 0,  'max' => 300],
                'tension_diastolique'     => ['type' => 'integer',  'required' => false, 'min' => 0,  'max' => 200],
                'saturation_o2'           => ['type' => 'number',   'required' => false, 'min' => 0,  'max' => 100],
                'frequence_cardiaque'     => ['type' => 'integer',  'required' => false, 'min' => 0,  'max' => 300],
                'frequence_respiratoire'  => ['type' => 'integer',  'required' => false, 'min' => 0,  'max' => 60],
                // Diabetology labs
                'glycemie'                => ['type' => 'number',   'required' => false, 'min' => 0],
                'glycemie_a_jeun'         => ['type' => 'number',   'required' => false, 'min' => 0],
                'glycemie_apres_repas'    => ['type' => 'number',   'required' => false, 'min' => 0],
                'hba1c'                   => ['type' => 'number',   'required' => false, 'min' => 0,  'max' => 20],
                'glucagon'                => ['type' => 'number',   'required' => false, 'min' => 0],
                'tt'                      => ['type' => 'number',   'required' => false],
                'th'                      => ['type' => 'number',   'required' => false],
                'glogylie'                => ['type' => 'string',   'required' => false, 'maxLength' => 500],
                'glucosurie'              => ['type' => 'string',   'required' => false, 'enum' => ['-', '+', '++', '+++']],
                'acetone'                 => ['type' => 'string',   'required' => false, 'enum' => ['-', '+', '++', '+++']],
                // Lipid panel
                'cholesterol_total'       => ['type' => 'number',   'required' => false, 'min' => 0],
                'triglycerides'           => ['type' => 'number',   'required' => false, 'min' => 0],
                'hdl'                     => ['type' => 'number',   'required' => false, 'min' => 0],
                'ldl'                     => ['type' => 'number',   'required' => false, 'min' => 0],
                // Clinical notes
                'examen_clinique'         => ['type' => 'string',   'required' => false],
                'diagnostic'              => ['type' => 'string',   'required' => false],
                'conduite_a_tenir'        => ['type' => 'string',   'required' => false],
                // Payment
                'prix'                    => ['type' => 'number',   'required' => false, 'min' => 0],
                'regle'                   => ['type' => 'boolean',  'required' => false],
            ],
        ]);
    }

    /**
     * Combine tension_systolique + tension_diastolique into tension_arterielle
     * and remove the split fields before persisting.
     */
    private function prepareData(array $validated): array
    {
        $sys = $validated['tension_systolique'] ?? null;
        $dia = $validated['tension_diastolique'] ?? null;

        unset($validated['tension_systolique'], $validated['tension_diastolique']);

        $validated['tension_arterielle'] = ($sys !== null && $dia !== null)
            ? "{$sys}/{$dia}"
            : null;

        return $validated;
    }
}
