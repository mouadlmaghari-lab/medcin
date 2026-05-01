<?php

namespace App\Http\Controllers\Api\V1\Patient;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConsultationResource;
use App\Http\Resources\MedicalReportResource;
use App\Models\Consultation;
use App\Models\MedicalReport;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    /**
     * Get all shared documents for patient (consultations, reports, etc).
     * GET /api/v1/patient/documents?type=
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        $patient = Patient::where('patient_account_id', $user->id)->first();

        if (!$patient) {
            abort(404, 'Patient non trouvé.');
        }

        $type = $request->query('type');

        $data = [];

        // Get shared consultations
        if (!$type || $type === 'consultation') {
            $data['consultations'] = Consultation::where('patient_id', $patient->id)
                ->with('doctor:id,nom_complet')
                ->latest('date_consultation')
                ->limit(10)
                ->get();
        }

        // Get shared medical reports
        if (!$type || $type === 'report') {
            $data['reports'] = MedicalReport::where('patient_id', $patient->id)
                ->where('partage_patient', true)
                ->with('patient:id,nom_complet')
                ->latest('date_rapport')
                ->limit(10)
                ->get();
        }

        return response()->json(['data' => $data]);
    }

    /**
     * Get consultation details.
     */
    public function showConsultation(Consultation $consultation): ConsultationResource
    {
        $user = auth('api')->user();
        $patient = Patient::where('patient_account_id', $user->id)->first();

        if (!$patient || $consultation->patient_id !== $patient->id) {
            abort(403, 'Accès non autorisé.');
        }

        $consultation->load(['doctor', 'patient']);

        return new ConsultationResource($consultation);
    }

    /**
     * Get medical report details.
     */
    public function showReport(MedicalReport $report): MedicalReportResource
    {
        $user = auth('api')->user();
        $patient = Patient::where('patient_account_id', $user->id)->first();

        if (!$patient || $report->patient_id !== $patient->id || !$report->partage_patient) {
            abort(403, 'Ce document n\'est pas partagé avec vous.');
        }

        $report->load('patient');

        return new MedicalReportResource($report);
    }

    /**
     * Download document (if available).
     * GET /api/v1/patient/documents/:id/download?type=report
     */
    public function download(Request $request, string $id): JsonResponse|\Illuminate\Http\Response
    {
        $user = auth('api')->user();
        $patient = Patient::where('patient_account_id', $user->id)->first();

        if (!$patient) {
            abort(404, 'Patient non trouvé.');
        }

        $type = $request->query('type', 'report');

        if ($type === 'report') {
            $document = MedicalReport::find($id);

            if (!$document || $document->patient_id !== $patient->id || !$document->partage_patient) {
                abort(403, 'Accès non autorisé.');
            }

            if (!$document->pdf_path) {
                return response()->json(['message' => 'Le PDF n\'est pas disponible.'], 404);
            }

            return response()->download(storage_path('app/' . $document->pdf_path));
        }

        return response()->json(['message' => 'Type de document invalide.'], 400);
    }
}
