<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;

/**
 * TwoFactorService
 *
 * Handles TOTP 2FA (Time-based One-Time Password) generation and verification
 * using HMAC-based OTP (RFC 6238) without external package dependency.
 *
 * Uses PHP's native hash_hmac() — no need for pragmarx/google2fa.
 */
class TwoFactorService
{
    /**
     * TOTP configuration.
     */
    private const PERIOD = 30;      // seconds per code
    private const DIGITS = 6;       // code length
    private const ALGORITHM = 'sha1'; // RFC 6238 default

    /**
     * Generate a new secret key for the user.
     */
    public function generateSecret(): string
    {
        // 160-bit secret encoded as base32 (32 characters)
        return $this->base32Encode(random_bytes(20));
    }

    /**
     * Generate an otpauth:// URI for QR code scanning.
     */
    public function getQrCodeUri(User $user, string $secret): string
    {
        $issuer = rawurlencode(config('app.name', 'TabibCare'));
        $account = rawurlencode($user->email);

        return "otpauth://totp/{$issuer}:{$account}?secret={$secret}&issuer={$issuer}&algorithm=SHA1&digits=" . self::DIGITS . "&period=" . self::PERIOD;
    }

    /**
     * Verify a TOTP code against the secret.
     * Accepts codes from the previous and next time windows (+/- 30s).
     */
    public function verify(string $secret, string $code): bool
    {
        $timestamp = time();

        // Check current window and ±1 window (30-second tolerance)
        for ($offset = -1; $offset <= 1; $offset++) {
            $timeSlice = intdiv($timestamp, self::PERIOD) + $offset;
            $expectedCode = $this->generateCode($secret, $timeSlice);

            if (hash_equals($expectedCode, str_pad($code, self::DIGITS, '0', STR_PAD_LEFT))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Enable 2FA for a user: store encrypted secret.
     */
    public function enable(User $user, string $secret, string $code): bool
    {
        if (!$this->verify($secret, $code)) {
            return false;
        }

        $user->update([
            'two_factor_secret'  => encrypt($secret),
            'two_factor_enabled' => true,
        ]);

        return true;
    }

    /**
     * Disable 2FA for a user.
     */
    public function disable(User $user): void
    {
        $user->update([
            'two_factor_secret'  => null,
            'two_factor_enabled' => false,
        ]);
    }

    /**
     * Check if user has 2FA enabled and needs verification.
     */
    public function isEnabled(User $user): bool
    {
        return (bool) $user->two_factor_enabled;
    }

    /**
     * Verify 2FA for login: decrypt stored secret and compare code.
     */
    public function verifyForLogin(User $user, string $code): bool
    {
        if (!$user->two_factor_enabled || !$user->two_factor_secret) {
            return true; // 2FA not enabled = always pass
        }

        try {
            $secret = decrypt($user->two_factor_secret);
        } catch (\Exception $e) {
            return false;
        }

        return $this->verify($secret, $code);
    }

    /**
     * Generate recovery codes for emergency access.
     */
    public function generateRecoveryCodes(int $count = 8): array
    {
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $codes[] = strtoupper(Str::random(4) . '-' . Str::random(4));
        }

        return $codes;
    }

    // ── Private helpers ─────────────────────────────────────────────────────

    /**
     * Generate a TOTP code for a given time slice.
     */
    private function generateCode(string $base32Secret, int $timeSlice): string
    {
        $secretKey = $this->base32Decode($base32Secret);

        // Pack time as 64-bit big-endian
        $time = pack('N*', 0, $timeSlice);

        // HMAC-SHA1
        $hash = hash_hmac(self::ALGORITHM, $time, $secretKey, true);

        // Dynamic truncation (RFC 4226 §5.4)
        $offset = ord($hash[strlen($hash) - 1]) & 0x0F;
        $binary = (
            ((ord($hash[$offset]) & 0x7F) << 24) |
            ((ord($hash[$offset + 1]) & 0xFF) << 16) |
            ((ord($hash[$offset + 2]) & 0xFF) << 8) |
            (ord($hash[$offset + 3]) & 0xFF)
        );

        $otp = $binary % pow(10, self::DIGITS);

        return str_pad((string) $otp, self::DIGITS, '0', STR_PAD_LEFT);
    }

    /**
     * Base32 encode (RFC 4648).
     */
    private function base32Encode(string $data): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $binary = '';

        foreach (str_split($data) as $char) {
            $binary .= str_pad(decbin(ord($char)), 8, '0', STR_PAD_LEFT);
        }

        $encoded = '';
        foreach (str_split($binary, 5) as $chunk) {
            $chunk = str_pad($chunk, 5, '0', STR_PAD_RIGHT);
            $encoded .= $alphabet[bindec($chunk)];
        }

        return $encoded;
    }

    /**
     * Base32 decode (RFC 4648).
     */
    private function base32Decode(string $base32): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $base32 = strtoupper(rtrim($base32, '='));
        $binary = '';

        foreach (str_split($base32) as $char) {
            $pos = strpos($alphabet, $char);
            if ($pos === false) {
                continue;
            }
            $binary .= str_pad(decbin($pos), 5, '0', STR_PAD_LEFT);
        }

        $decoded = '';
        foreach (str_split($binary, 8) as $byte) {
            if (strlen($byte) < 8) {
                break;
            }
            $decoded .= chr(bindec($byte));
        }

        return $decoded;
    }
}
