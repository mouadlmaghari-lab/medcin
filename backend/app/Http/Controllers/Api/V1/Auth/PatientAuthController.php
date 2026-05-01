<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\PatientRegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class PatientAuthController extends Controller
{
    /**
     * Patient registration via mobile app.
     * Creates a user with the 'patient' role and returns a JWT token pair.
     */
    public function register(PatientRegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'       => $request->prenom . ' ' . $request->nom,
            'nom_complet' => $request->prenom . ' ' . $request->nom,
            'email'      => $request->email,
            'telephone'  => $request->telephone,
            'password'   => Hash::make($request->password),
            'role'       => UserRole::PATIENT,
            'language'   => $request->language ?? 'fr',
            'active'     => true,
        ]);

        $user->assignRole(UserRole::PATIENT->value);

        $token = JWTAuth::fromUser($user);
        $refreshToken = $this->generateRefreshToken($user);

        return response()->json([
            'data' => [
                'user'          => $this->patientPayload($user),
                'access_token'  => $token,
                'refresh_token' => $refreshToken,
                'token_type'    => 'bearer',
                'expires_in'    => config('jwt.ttl') * 60, // seconds
            ],
            'message' => 'Compte créé avec succès.',
        ], 201);
    }

    /**
     * Patient login via mobile app.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $credentials = $request->only('email', 'password');

        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json([
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        /** @var User $user */
        $user = auth('api')->user();

        if (! $user->active) {
            auth('api')->logout();
            return response()->json([
                'message' => 'Ce compte est désactivé.',
            ], 403);
        }

        if (! $user->hasRole(UserRole::PATIENT->value)) {
            auth('api')->logout();
            return response()->json([
                'message' => 'Accès non autorisé.',
            ], 403);
        }

        $refreshToken = $this->generateRefreshToken($user);

        return response()->json([
            'data' => [
                'user'          => $this->patientPayload($user),
                'access_token'  => $token,
                'refresh_token' => $refreshToken,
                'token_type'    => 'bearer',
                'expires_in'    => config('jwt.ttl') * 60,
            ],
            'message' => 'Connexion réussie.',
        ]);
    }

    /**
     * Refresh JWT access token using refresh token.
     */
    public function refresh(Request $request): JsonResponse
    {
        $request->validate([
            'refresh_token' => ['required', 'string'],
        ]);

        try {
            // Validate refresh token from personal access token store
            $hashedToken = hash('sha256', $request->refresh_token);
            $tokenRecord = \DB::table('patient_refresh_tokens')
                ->where('token', $hashedToken)
                ->where('expires_at', '>', now())
                ->first();

            if (! $tokenRecord) {
                return response()->json(['message' => 'Refresh token invalide ou expiré.'], 401);
            }

            $user = User::findOrFail($tokenRecord->user_id);
            $newAccessToken = JWTAuth::fromUser($user);
            $newRefreshToken = $this->generateRefreshToken($user, $tokenRecord->id);

            return response()->json([
                'data' => [
                    'access_token'  => $newAccessToken,
                    'refresh_token' => $newRefreshToken,
                    'token_type'    => 'bearer',
                    'expires_in'    => config('jwt.ttl') * 60,
                ],
                'message' => 'Token renouvelé.',
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Impossible de renouveler le token.'], 401);
        }
    }

    /**
     * Patient logout — blacklist JWT.
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            auth('api')->logout(true); // true = force token invalidation (blacklist)
        } catch (\Exception $e) {
            // Token may already be invalid
        }

        // Also revoke refresh token if provided
        if ($request->has('refresh_token')) {
            $hashedToken = hash('sha256', $request->refresh_token);
            \DB::table('patient_refresh_tokens')->where('token', $hashedToken)->delete();
        }

        return response()->json(['message' => 'Déconnecté.']);
    }

    /**
     * Generate a 30-day refresh token stored in DB.
     */
    private function generateRefreshToken(User $user, ?int $replaceId = null): string
    {
        $plainToken = bin2hex(random_bytes(40));
        $hashedToken = hash('sha256', $plainToken);

        if ($replaceId) {
            \DB::table('patient_refresh_tokens')->where('id', $replaceId)->delete();
        }

        \DB::table('patient_refresh_tokens')->insert([
            'user_id'    => $user->id,
            'token'      => $hashedToken,
            'expires_at' => now()->addDays(30),
            'created_at' => now(),
        ]);

        return $plainToken;
    }

    private function patientPayload(User $user): array
    {
        return [
            'id'        => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'telephone' => $user->telephone,
            'language'  => $user->language,
        ];
    }
}
