<?php

namespace App\Http\Controllers\Api\V1\Patient;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Patient login via JWT (mobile app).
     * Returns JWT token + refresh token for React Native app.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        $user = Auth::user();

        // Check if user is a patient account
        if ($user->role !== 'patient') {
            return response()->json([
                'message' => 'Cet utilisateur n\'est pas un patient.',
            ], 403);
        }

        if (! $user->active) {
            return response()->json([
                'message' => 'Ce compte est désactivé.',
            ], 403);
        }

        // Generate JWT token with 30-day expiry
        $token = JWTAuth::fromUser($user);
        $payload = JWTAuth::decode($token);
        $expires_at = $payload->exp;

        return response()->json([
            'data' => [
                'user'   => $this->patientPayload($user),
                'token'  => $token,
                'expires_at' => $expires_at,
            ],
            'message' => 'Connexion réussie.',
        ]);
    }

    /**
     * Logout — invalidate JWT token.
     */
    public function logout(Request $request): JsonResponse
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json(['message' => 'Déconnecté.']);
    }

    /**
     * Refresh JWT token.
     */
    public function refresh(Request $request): JsonResponse
    {
        try {
            $token = JWTAuth::refresh(JWTAuth::getToken());

            return response()->json([
                'data' => ['token' => $token],
                'message' => 'Token actualisé.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Impossible d\'actualiser le token.',
            ], 401);
        }
    }

    /**
     * Get current authenticated patient.
     */
    public function me(Request $request): JsonResponse
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json([
                'message' => 'Non authentifié.',
            ], 401);
        }

        return response()->json([
            'data' => $this->patientPayload($user),
        ]);
    }

    /**
     * Patient payload for response.
     */
    private function patientPayload($user): array
    {
        return [
            'id'           => $user->id,
            'name'         => $user->name,
            'email'        => $user->email,
            'language'     => $user->language ?? 'fr',
            'phone'        => $user->phone,
        ];
    }
}
