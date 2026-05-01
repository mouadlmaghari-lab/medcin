<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Verify2FA
 *
 * Checks if the user has completed 2FA verification (when 2FA is enabled).
 * Applied to sensitive routes that require 2FA-verified session.
 */
class Verify2FA
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        // If 2FA is not enabled, pass through
        if (!$user->two_factor_enabled) {
            return $next($request);
        }

        // Check if session is 2FA-verified
        $token = $user->currentAccessToken();
        if ($token && cache()->get("2fa_verified_{$token->id}")) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Vérification 2FA requise.',
            'two_factor_required' => true,
        ], 403);
    }
}
