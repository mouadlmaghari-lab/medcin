<?php

namespace App\Services;

use App\Models\DoctorPatientLink;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Activitylog\Models\Activity;

/**
 * ComplianceService
 *
 * Enforces Moroccan Law 09-08 (data protection) and Law 05-20 (cybersecurity) requirements:
 *
 * Law 09-08 (Loi n° 09-08):
 *   - Explicit consent before processing personal data
 *   - Right to access, rectify, and delete personal data
 *   - Data minimization (collect only what's necessary)
 *   - Purpose limitation (data used only for stated purpose)
 *
 * Law 05-20 (Loi n° 05-20):
 *   - Security measures for personal data processing
 *   - Incident notification requirements
 *   - Audit trail for sensitive operations (5-year retention)
 *   - Access control and authentication
 */
class ComplianceService
{
    /**
     * Verify that a patient has given consent for a specific doctor.
     * Law 09-08 requires explicit consent before processing medical data.
     */
    public function hasPatientConsent(int $patientId, int $doctorId): bool
    {
        return DoctorPatientLink::where('patient_id', $patientId)
            ->where('doctor_id', $doctorId)
            ->where('statut', 'approved')
            ->whereNotNull('consent_at')
            ->exists();
    }

    /**
     * Record patient consent with timestamp and IP.
     * Law 09-08 Art. 4: Consent must be freely given, specific, informed.
     */
    public function recordConsent(int $linkId, string $ip = null): void
    {
        $link = DoctorPatientLink::findOrFail($linkId);

        $link->update([
            'consent_at' => now(),
            'statut'     => 'approved',
        ]);

        activity('compliance')
            ->performedOn($link)
            ->withProperties([
                'action' => 'consent_recorded',
                'ip'     => $ip,
                'law'    => 'Loi 09-08 Art. 4',
            ])
            ->log('Patient consent recorded for doctor-patient link');
    }

    /**
     * Revoke patient consent (right to withdraw).
     * Law 09-08 Art. 7: Consent can be withdrawn at any time.
     */
    public function revokeConsent(int $linkId, string $reason = null): void
    {
        $link = DoctorPatientLink::findOrFail($linkId);

        $link->update([
            'statut' => 'revoked',
        ]);

        activity('compliance')
            ->performedOn($link)
            ->withProperties([
                'action' => 'consent_revoked',
                'reason' => $reason,
                'law'    => 'Loi 09-08 Art. 7',
            ])
            ->log('Patient consent revoked');
    }

    /**
     * Generate a data access report for a patient (right of access).
     * Law 09-08 Art. 7: Individuals have the right to access their data.
     */
    public function generateAccessReport(int $patientId): array
    {
        $activities = Activity::where('properties->subject->patient->id', $patientId)
            ->orWhere('properties->subject->Patient->id', $patientId)
            ->orderBy('created_at', 'desc')
            ->limit(500)
            ->get();

        return [
            'patient_id'     => $patientId,
            'generated_at'   => now()->toIso8601String(),
            'total_accesses' => $activities->count(),
            'accesses'       => $activities->map(fn ($a) => [
                'date'       => $a->created_at->toIso8601String(),
                'action'     => $a->properties['action'] ?? $a->description,
                'causer'     => $a->causer_type . ':' . $a->causer_id,
                'ip'         => $a->properties['ip'] ?? null,
            ])->toArray(),
            'law_reference'  => 'Loi 09-08 Art. 7 — Droit d\'accès',
        ];
    }

    /**
     * Clean up audit logs older than retention period.
     * Law 05-20: 5-year minimum retention for medical data audit trails.
     */
    public function cleanupExpiredLogs(): int
    {
        $threshold = now()->subYears(5);

        $count = Activity::where('created_at', '<', $threshold)->count();

        if ($count > 0) {
            Activity::where('created_at', '<', $threshold)->delete();

            Log::info("Compliance cleanup: removed {$count} audit log entries older than 5 years.");
        }

        return $count;
    }

    /**
     * Check compliance status for a tenant.
     */
    public function auditTenantCompliance(int $tenantId): array
    {
        $issues = [];

        // Check: All patient links have consent recorded
        $linksWithoutConsent = DoctorPatientLink::where('doctor_id', $tenantId)
            ->where('statut', 'approved')
            ->whereNull('consent_at')
            ->count();

        if ($linksWithoutConsent > 0) {
            $issues[] = [
                'severity' => 'critical',
                'issue'    => "{$linksWithoutConsent} patient link(s) approved without recorded consent",
                'law'      => 'Loi 09-08 Art. 4',
                'fix'      => 'Record explicit consent for each patient',
            ];
        }

        // Check: Activity logging is enabled
        if (!config('activitylog.enabled')) {
            $issues[] = [
                'severity' => 'critical',
                'issue'    => 'Activity logging is disabled',
                'law'      => 'Loi 05-20',
                'fix'      => 'Enable ACTIVITY_LOGGER_ENABLED in .env',
            ];
        }

        // Check: 2FA adoption rate
        $totalDoctors = DB::table('users')
            ->where('id', $tenantId)
            ->orWhere('tenant_id', $tenantId)
            ->count();

        $with2FA = DB::table('users')
            ->where(function ($q) use ($tenantId) {
                $q->where('id', $tenantId)->orWhere('tenant_id', $tenantId);
            })
            ->where('two_factor_enabled', true)
            ->count();

        if ($totalDoctors > 0 && $with2FA === 0) {
            $issues[] = [
                'severity' => 'warning',
                'issue'    => 'No users have 2FA enabled',
                'law'      => 'Loi 05-20 Art. 24',
                'fix'      => 'Enable 2FA for doctor and assistant accounts',
            ];
        }

        return [
            'tenant_id'    => $tenantId,
            'checked_at'   => now()->toIso8601String(),
            'compliant'    => count(array_filter($issues, fn ($i) => $i['severity'] === 'critical')) === 0,
            'issues'       => $issues,
            'issue_count'  => count($issues),
        ];
    }
}
