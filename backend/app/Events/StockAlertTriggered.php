<?php

namespace App\Events;

use App\Models\Medication;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockAlertTriggered
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Medication $medication,
        public readonly string $alertType = 'low_stock', // 'low_stock' | 'expiring'
    ) {}
}
