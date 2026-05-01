<?php

namespace App\Http\Controllers\Api\V1\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\UpdatePermissionsRequest;
use App\Models\DoctorPatientLink;
use App\Models\Patient;
use App\Models\PatientPermission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    /**
     * Get list of linked doctors for patient.
     * GET /api/v1/patient/doctors?statut=approved
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth('api')->user();
        $patient = Patient::where('patient_account_id', $user->id)->first();

        if (!$patient) {
            abort(404, 'Patient non trouvé.');
        }

        $query = $patient->doctorLinks()
            ->with(['doctor:id,nom_complet,specialite,telephone,email', 'permissions']);

        // Filter by status if provided
        if ($request->has('statut')) {
            $query->where('statut', $request->query('statut'));
        }

        $doctors = $query->get()->map(fn ($link) => [
            'link_id'     => $link->id,
            'statut'      => $link->statut,
            'consent_at'  => $link->consent_at?->toISOString(),
            'doctor'      => [
                'id'         => $link->doctor->id,
                'name'       => $link->doctor->nom_complet,
                'specialite' => $link->doctor->specialite,
                'phone'      => $link->doctor->telephone,
                'email'      => $link->doctor->email,
            ],
            'permissions' => $link->permissions ? [
                'partager_consultations' => $link->permissions->partager_consultations,
                'partager_analyses'      => $link->permissions->partager_analyses,
                'voir_historique'        => $link->permissions->voir_historique,
            ] : null,
        ]);

        return response()->json(['data' => $doctors]);
    }

    /**
     * Get single doctor details.
     */
    public function show(DoctorPatientLink $link): JsonResponse
    {
        $user = auth('api')->user();
        $patient = Patient::where('patient_account_id', $user->id)->first();

        if (!$patient || $link->patient_record_id !== $patient->id) {
            abort(403, 'Accès non autorisé.');
        }

        $link->load(['doctor:id,nom_complet,specialite,telephone,email', 'permissions']);

        return response()->json([
            'data' => [
                'link_id'     => $link->id,
                'statut'      => $link->statut,
                'consent_at'  => $link->consent_at?->toISOString(),
                'doctor'      => [
                    'id'         => $link->doctor->id,
                    'name'       => $link->doctor->nom_complet,
                    'specialite' => $link->doctor->specialite,
                    'phone'      => $link->doctor->telephone,
                    'email'      => $link->doctor->email,
                ],
                'permissions' => $link->permissions ? [
                    'partager_consultations' => $link->permissions->partager_consultations,
                    'partager_analyses'      => $link->permissions->partager_analyses,
                    'voir_historique'        => $link->permissions->voir_historique,
                ] : null,
            ],
        ]);
    }

    /**
     * Update permissions for a doctor link.
     * PATCH /api/v1/patient/doctors/:link_id/permissions
     */
    public function updatePermissions(UpdatePermissionsRequest $request, DoctorPatientLink $link): JsonResponse
    {
        $user = auth('api')->user();
        $patient = Patient::where('patient_account_id', $user->id)->first();

        if (!$patient || $link->patient_record_id !== $patient->id) {
            abort(403, 'Accès non autorisé.');
        }

        // Get or create permissions
        $permissions = PatientPermission::firstOrCreate(
            ['link_id' => $link->id],
            ['link_id' => $link->id]
        );

        // Update permissions
        $permissions->update($request->validated());

        return response()->json([
            'data' => $permissions,
            'message' => 'Permissions mises à jour.',
        ]);
    }

    /**
     * Revoke access to a doctor.
     * DELETE /api/v1/patient/doctors/:link_id
     */
    public function revoke(DoctorPatientLink $link): JsonResponse
    {
        $user = auth('api')->user();
        $patient = Patient::where('patient_account_id', $user->id)->first();

        if (!$patient || $link->patient_record_id !== $patient->id) {
            abort(403, 'Accès non autorisé.');
        }

        $link->update(['statut' => 'revoked']);

        return response()->json(['message' => 'Accès au médecin révoqué.']);
    }
}
