<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * Doctor/Secretary login via Laravel Sanctum.
     * Returns a personal access token for the web app.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        $user = Auth::user();

        if (! $user->active) {
            Auth::logout();
            return response()->json([
                'message' => 'Ce compte est désactivé.',
            ], 403);
        }

        // Revoke previous tokens to enforce single-session per device
        $user->tokens()->where('name', 'web-session')->delete();

        $token = $user->createToken('web-session', ['*'], now()->addHours(8));

        return response()->json([
            'data' => [
                'user'  => $this->userPayload($user),
                'token' => $token->plainTextToken,
                'expires_at' => $token->accessToken->expires_at,
            ],
            'message' => 'Connexion réussie.',
        ]);
    }

    /**
     * Logout — revoke current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }

    private function userPayload($user): array
    {
        return [
            'id'           => $user->id,
            'name'         => $user->name,
            'nom_complet'  => $user->nom_complet,
            'email'        => $user->email,
            'role'         => $user->role,
            'language'     => $user->language,
            'specialite'   => $user->specialite,
        ];
    }
}
