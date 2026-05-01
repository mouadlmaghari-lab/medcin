<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StoreMedicalReportRequest;
use App\Http\Resources\MedicalReportResource;
use App\Models\MedicalReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MedicalReportController extends Controller
{
    /**
     * List medical reports with filters.
     * GET /api/v1/doctor/medical-reports?patient_id=&partage_patient=&date_from=&date_to=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = MedicalReport::query()
            ->with('patient:id,nom_complet,numero_dossier')
            ->when($request->patient_id, fn ($q, $id) => $q->where('patient_id', $id))
            ->when($request->has('partage_patient'), fn ($q) => $q->where('partage_patient', $request->boolean('partage_patient')))
            ->when($request->date_from, fn ($q, $d) => $q->where('date_rapport', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->where('date_rapport', '<=', $d))
            ->latest('date_rapport');

        $perPage = min($request->integer('per_page', 15), 100);

        return MedicalReportResource::collection($query->paginate($perPage));
    }

    /**
     * Create medical report.
     */
    public function store(StoreMedicalReportRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['partage_patient'] = $data['partage_patient'] ?? false;

        $report = MedicalReport::create($data);

        return (new MedicalReportResource($report->load('patient')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show medical report.
     */
    public function show(MedicalReport $report): MedicalReportResource
    {
        $report->load('patient');

        return new MedicalReportResource($report);
    }

    /**
     * Update medical report.
     */
    public function update(StoreMedicalReportRequest $request, MedicalReport $report): MedicalReportResource
    {
        $data = $request->validated();

        $report->update([
            'titre'           => $data['titre'],
            'contenu'         => $data['contenu'],
            'date_rapport'    => $data['date_rapport'],
            'partage_patient' => $data['partage_patient'] ?? $report->partage_patient,
        ]);

        return new MedicalReportResource($report->fresh()->load('patient'));
    }

    /**
     * Delete medical report.
     */
    public function destroy(MedicalReport $report): JsonResponse
    {
        $report->delete();

        return response()->json(['message' => 'Rapport médical supprimé.']);
    }

    /**
     * Toggle patient sharing for a report.
     * PATCH /api/v1/doctor/medical-reports/:id/toggle-share
     */
    public function toggleShare(MedicalReport $report): MedicalReportResource
    {
        $report->update(['partage_patient' => !$report->partage_patient]);

        return new MedicalReportResource($report->fresh());
    }
}
