<?php

namespace App\Http\Controllers\Api\V1\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patient\UpdateProfileRequest;
use App\Http\Resources\PatientResource;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    /**
     * Get current patient's profile.
     */
    public function show(): PatientResource
    {
        $user = auth('api')->user();
        $patient = Patient::where('patient_account_id', $user->id)->first();

        if (!$patient) {
            abort(404, 'Profil patient non trouvé.');
        }

        return new PatientResource($patient->load(['media']));
    }

    /**
     * Update patient profile (name, phone, language, etc).
     */
    public function update(UpdateProfileRequest $request): PatientResource
    {
        $user = auth('api')->user();
        $patient = Patient::where('patient_account_id', $user->id)->first();

        if (!$patient) {
            abort(404, 'Profil patient non trouvé.');
        }

        // Update patient record fields
        $patient->update($request->validated());

        // Update user account fields if provided
        if ($request->has('email') || $request->has('language')) {
            $user->update($request->only(['email', 'language']));
        }

        return new PatientResource($patient->fresh());
    }

    /**
     * Get medical records permissions.
     */
    public function permissions(): JsonResponse
    {
        $user = auth('api')->user();
        $patient = Patient::where('patient_account_id', $user->id)->first();

        if (!$patient) {
            abort(404, 'Profil patient non trouvé.');
        }

        $doctors = $patient->doctorLinks()
            ->with(['doctor', 'permissions'])
            ->approved()
            ->get()
            ->map(fn ($link) => [
                'id' => $link->id,
                'doctor' => [
                    'id' => $link->doctor->id,
                    'name' => $link->doctor->nom_complet,
                    'specialite' => $link->doctor->specialite,
                ],
                'permissions' => $link->permissions ? [
                    'partager_consultations' => $link->permissions->partager_consultations,
                    'partager_analyses'      => $link->permissions->partager_analyses,
                    'voir_historique'        => $link->permissions->voir_historique,
                ] : null,
            ]);

        return response()->json(['data' => $doctors]);
    }
}
