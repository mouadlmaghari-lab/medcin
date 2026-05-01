<?php

namespace App\Console\Commands;

use App\Events\StockAlertTriggered;
use App\Models\Medication;
use Illuminate\Console\Command;

/**
 * CheckStockAlerts
 *
 * Scans all medications for low stock or approaching expiration dates
 * and dispatches StockAlertTriggered events.
 *
 * Schedule: Run daily at 08:00.
 */
class CheckStockAlerts extends Command
{
    protected $signature = 'notifications:stock-alerts';

    protected $description = 'Check medication stock levels and expiration dates, send alerts';

    public function handle(): int
    {
        $alerts = 0;

        // Low stock: stock_actuel <= seuil_alerte
        $lowStock = Medication::query()
            ->whereColumn('stock_actuel', '<=', 'seuil_alerte')
            ->where('stock_actuel', '>', 0)
            ->where('actif', true)
            ->get();

        foreach ($lowStock as $med) {
            StockAlertTriggered::dispatch($med, 'low_stock');
            $alerts++;
        }

        // Expiring within 30 days
        $expiring = Medication::query()
            ->where('date_expiration', '<=', now()->addDays(30))
            ->where('date_expiration', '>', now())
            ->where('actif', true)
            ->get();

        foreach ($expiring as $med) {
            StockAlertTriggered::dispatch($med, 'expiring');
            $alerts++;
        }

        $this->info("✅ Stock check complete. Alerts sent: {$alerts}");

        return self::SUCCESS;
    }
}
