<?php

namespace App\Http\Controllers\Api\V1\Patient;

use App\Http\Controllers\Controller;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AppointmentController extends Controller
{
    /**
     * List patient's appointments (read-only).
     * GET /api/v1/patient/appointments?date_from=&date_to=&etat=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = auth('api')->user();
        $patient = Patient::where('patient_account_id', $user->id)->first();

        if (!$patient) {
            abort(404, 'Patient non trouvé.');
        }

        $query = Appointment::query()
            ->where('patient_id', $patient->id)
            ->with('patient:id,nom_complet,telephone')
            ->when($request->date_from, fn ($q, $d) => $q->where('debut', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->where('debut', '<=', $d))
            ->when($request->etat, fn ($q, $e) => $q->where('etat', $e))
            ->orderBy('debut');

        return AppointmentResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    /**
     * Show single appointment details.
     */
    public function show(Appointment $appointment): AppointmentResource
    {
        $user = auth('api')->user();
        $patient = Patient::where('patient_account_id', $user->id)->first();

        if (!$patient || $appointment->patient_id !== $patient->id) {
            abort(403, 'Accès non autorisé.');
        }

        $appointment->load(['patient', 'consultation']);

        return new AppointmentResource($appointment);
    }

    /**
     * Patients cannot create appointments (create via web or phone).
     */
    public function store(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Les patients ne peuvent pas créer des rendez-vous via l\'app mobile.',
        ], 403);
    }

    /**
     * Patients cannot modify appointments.
     */
    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        return response()->json([
            'message' => 'Les patients ne peuvent pas modifier les rendez-vous.',
        ], 403);
    }

    /**
     * Patients cannot delete appointments.
     */
    public function destroy(Appointment $appointment): JsonResponse
    {
        return response()->json([
            'message' => 'Les patients ne peuvent pas annuler les rendez-vous via l\'app.',
        ], 403);
    }
}
