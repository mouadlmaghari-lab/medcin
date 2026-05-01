<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use App\Models\User;

class RegisterController extends Controller
{
    /**
     * Doctor self-registration.
     * Creates a doctor account. The doctor IS their own tenant.
     * Returns a Sanctum token valid for 8 hours.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom_complet'  => ['required', 'string', 'max:150'],
            'email'        => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'     => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'telephone'    => ['nullable', 'string', 'max:20'],
            'specialite'   => ['nullable', 'string', 'max:100'],
            'language'     => ['nullable', 'string', 'in:fr,ar,en'],
        ]);

        $user = User::create([
            'name'         => $validated['nom_complet'],
            'nom_complet'  => $validated['nom_complet'],
            'email'        => $validated['email'],
            'password'     => Hash::make($validated['password']),
            'telephone'    => $validated['telephone'] ?? null,
            'specialite'   => $validated['specialite'] ?? null,
            'language'     => $validated['language'] ?? 'fr',
            'role'         => UserRole::DOCTOR,
            'active'       => true,
        ]);

        // Doctor's tenant_id points to their own user id
        $user->update(['tenant_id' => $user->id]);

        $user->assignRole(UserRole::DOCTOR->value);

        $token = $user->createToken('web-session', ['*'], now()->addHours(8));

        return response()->json([
            'data' => [
                'user'       => $this->userPayload($user),
                'token'      => $token->plainTextToken,
                'expires_at' => $token->accessToken->expires_at,
            ],
            'message' => 'Compte créé avec succès.',
        ], 201);
    }

    private function userPayload(User $user): array
    {
        return [
            'id'          => $user->id,
            'name'        => $user->name,
            'nom_complet' => $user->nom_complet,
            'email'       => $user->email,
            'role'        => $user->role,
            'language'    => $user->language,
            'specialite'  => $user->specialite,
        ];
    }
}
