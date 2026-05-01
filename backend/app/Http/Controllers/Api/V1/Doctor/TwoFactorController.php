<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Services\TwoFactorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * TwoFactorController
 *
 * Manages 2FA (TOTP) setup for doctor accounts.
 * Moroccan Law 05-20 recommends multi-factor authentication for medical data access.
 */
class TwoFactorController extends Controller
{
    public function __construct(
        private readonly TwoFactorService $twoFactor,
    ) {}

    /**
     * GET /2fa/status
     * Check if 2FA is enabled for the authenticated user.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'two_factor_enabled' => $this->twoFactor->isEnabled($user),
        ]);
    }

    /**
     * POST /2fa/setup
     * Generate a new 2FA secret + QR code URI.
     * The user must scan the QR code and confirm with a code before 2FA is activated.
     */
    public function setup(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($this->twoFactor->isEnabled($user)) {
            return response()->json([
                'message' => 'L\'authentification à deux facteurs est déjà activée.',
            ], 422);
        }

        $secret = $this->twoFactor->generateSecret();
        $qrUri = $this->twoFactor->getQrCodeUri($user, $secret);

        // Store secret temporarily in session/cache for confirmation step
        cache()->put("2fa_setup_{$user->id}", $secret, now()->addMinutes(10));

        return response()->json([
            'secret' => $secret,
            'qr_uri' => $qrUri,
            'message' => 'Scannez le QR code avec votre application d\'authentification, puis confirmez avec un code.',
        ]);
    }

    /**
     * POST /2fa/confirm
     * Confirm 2FA setup by verifying a code from the authenticator app.
     */
    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();
        $secret = cache()->get("2fa_setup_{$user->id}");

        if (!$secret) {
            return response()->json([
                'message' => 'Session de configuration expirée. Veuillez relancer la configuration.',
            ], 422);
        }

        if (!$this->twoFactor->enable($user, $secret, $request->code)) {
            return response()->json([
                'message' => 'Code invalide. Veuillez réessayer.',
            ], 422);
        }

        // Generate recovery codes
        $recoveryCodes = $this->twoFactor->generateRecoveryCodes();
        $user->update([
            'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes)),
        ]);

        cache()->forget("2fa_setup_{$user->id}");

        activity('security')
            ->causedBy($user)
            ->withProperties(['ip' => $request->ip()])
            ->log('2FA enabled');

        return response()->json([
            'message' => 'Authentification à deux facteurs activée avec succès.',
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    /**
     * POST /2fa/verify
     * Verify a 2FA code during login flow.
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (!$this->twoFactor->verifyForLogin($user, $request->code)) {
            activity('security')
                ->causedBy($user)
                ->withProperties(['ip' => $request->ip()])
                ->log('2FA verification failed');

            return response()->json([
                'message' => 'Code 2FA invalide.',
            ], 422);
        }

        // Mark session as 2FA-verified
        $token = $user->currentAccessToken();
        if ($token) {
            cache()->put("2fa_verified_{$token->id}", true, now()->addHours(12));
        }

        activity('security')
            ->causedBy($user)
            ->withProperties(['ip' => $request->ip()])
            ->log('2FA verification successful');

        return response()->json([
            'message' => 'Vérification réussie.',
            'verified' => true,
        ]);
    }

    /**
     * DELETE /2fa/disable
     * Disable 2FA (requires current password confirmation).
     */
    public function disable(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string',
            'code'     => 'required|string|size:6',
        ]);

        $user = $request->user();

        // Verify current password
        if (!password_verify($request->password, $user->password)) {
            return response()->json([
                'message' => 'Mot de passe incorrect.',
            ], 422);
        }

        // Verify 2FA code one last time
        if (!$this->twoFactor->verifyForLogin($user, $request->code)) {
            return response()->json([
                'message' => 'Code 2FA invalide.',
            ], 422);
        }

        $this->twoFactor->disable($user);

        activity('security')
            ->causedBy($user)
            ->withProperties(['ip' => $request->ip()])
            ->log('2FA disabled');

        return response()->json([
            'message' => 'Authentification à deux facteurs désactivée.',
        ]);
    }
}
