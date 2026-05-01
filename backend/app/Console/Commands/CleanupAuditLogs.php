<?php

namespace App\Console\Commands;

use App\Services\ComplianceService;
use Illuminate\Console\Command;

/**
 * CleanupAuditLogs
 *
 * Scheduled command to remove audit logs older than 5 years.
 * Moroccan Law 05-20 requires 5-year retention for medical data audit trails.
 *
 * Schedule: Run monthly via Laravel Scheduler.
 * Usage: php artisan audit:cleanup
 */
class CleanupAuditLogs extends Command
{
    protected $signature = 'audit:cleanup {--dry-run : Preview without deleting}';

    protected $description = 'Remove audit log entries older than 5 years (Moroccan Law 05-20 compliance)';

    public function handle(ComplianceService $compliance): int
    {
        if ($this->option('dry-run')) {
            $count = \Spatie\Activitylog\Models\Activity::where('created_at', '<', now()->subYears(5))->count();
            $this->info("Dry run: {$count} log entries would be removed.");

            return self::SUCCESS;
        }

        $removed = $compliance->cleanupExpiredLogs();

        $this->info("✅ Audit cleanup complete. Removed: {$removed} entries older than 5 years.");

        return self::SUCCESS;
    }
}
