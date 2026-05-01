<?php

namespace App\Providers;

use App\Events\AppointmentBooked;
use App\Events\AppointmentCancelled;
use App\Events\AppointmentRescheduled;
use App\Events\ConsultationCompleted;
use App\Events\DocumentShared;
use App\Events\PaymentReceived;
use App\Events\PrescriptionCreated;
use App\Events\StockAlertTriggered;
use App\Listeners\SendNotificationListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * Each event maps to its handler method on the SendNotificationListener.
     */
    protected $listen = [
        AppointmentBooked::class => [
            [SendNotificationListener::class, 'handleAppointmentBooked'],
        ],
        AppointmentCancelled::class => [
            [SendNotificationListener::class, 'handleAppointmentCancelled'],
        ],
        AppointmentRescheduled::class => [
            [SendNotificationListener::class, 'handleAppointmentRescheduled'],
        ],
        ConsultationCompleted::class => [
            [SendNotificationListener::class, 'handleConsultationCompleted'],
        ],
        PrescriptionCreated::class => [
            [SendNotificationListener::class, 'handlePrescriptionCreated'],
        ],
        PaymentReceived::class => [
            [SendNotificationListener::class, 'handlePaymentReceived'],
        ],
        DocumentShared::class => [
            [SendNotificationListener::class, 'handleDocumentShared'],
        ],
        StockAlertTriggered::class => [
            [SendNotificationListener::class, 'handleStockAlert'],
        ],
    ];

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
