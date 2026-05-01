<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Doctor\StoreAppointmentRequest;
use App\Http\Requests\Doctor\UpdateAppointmentRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class AppointmentController extends Controller
{
    /**
     * List appointments with filters.
     * GET /api/v1/doctor/appointments?date=&date_from=&date_to=&etat=&patient_id=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Appointment::query()
            ->with('patient:id,nom_complet,telephone,numero_dossier')
            ->when($request->date, fn ($q, $d) => $q->whereDate('debut', $d))
            ->when($request->date_from, fn ($q, $d) => $q->where('debut', '>=', $d))
            ->when($request->date_to, fn ($q, $d) => $q->where('debut', '<=', $d))
            ->when($request->etat, fn ($q, $e) => $q->where('etat', $e))
            ->when($request->patient_id, fn ($q, $id) => $q->where('patient_id', $id))
            ->orderBy('debut');

        $perPage = min($request->integer('per_page', 50), 200);

        return AppointmentResource::collection($query->paginate($perPage));
    }

    /**
     * Create appointment with conflict detection.
     */
    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Conflict detection: unique slot per doctor
        $conflict = Appointment::where('debut', $data['debut'])->first();
        if ($conflict) {
            throw ValidationException::withMessages([
                'debut' => ['Un rendez-vous existe déjà à cette heure.'],
            ]);
        }

        $data['created_by'] = auth()->id();
        $data['booking_source'] = $data['booking_source'] ?? 'web';

        // Auto-fill patient info if patient_id provided
        if (!empty($data['patient_id']) && empty($data['patient_name'])) {
            $patient = \App\Models\Patient::find($data['patient_id']);
            if ($patient) {
                $data['patient_name'] = $data['patient_name'] ?? $patient->nom_complet;
                $data['telephone'] = $data['telephone'] ?? $patient->telephone;
            }
        }

        $appointment = Appointment::create($data);

        return (new AppointmentResource($appointment->load('patient')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show single appointment.
     */
    public function show(Appointment $appointment): AppointmentResource
    {
        $appointment->load(['patient', 'consultation']);

        return new AppointmentResource($appointment);
    }

    /**
     * Update appointment (status transitions, reschedule).
     */
    public function update(UpdateAppointmentRequest $request, Appointment $appointment): AppointmentResource
    {
        $data = $request->validated();

        // If rescheduling, check conflict
        if (isset($data['debut']) && $data['debut'] !== $appointment->debut->toDateTimeString()) {
            $conflict = Appointment::where('debut', $data['debut'])
                ->where('id', '!=', $appointment->id)
                ->first();
            if ($conflict) {
                throw ValidationException::withMessages([
                    'debut' => ['Un rendez-vous existe déjà à cette heure.'],
                ]);
            }
        }

        $appointment->update($data);

        return new AppointmentResource($appointment->fresh()->load('patient'));
    }

    /**
     * Delete appointment.
     */
    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->delete();

        return response()->json(['message' => 'Rendez-vous supprimé.']);
    }
}
