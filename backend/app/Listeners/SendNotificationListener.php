<?php

namespace App\Listeners;

use App\Events\AppointmentBooked;
use App\Events\AppointmentCancelled;
use App\Events\AppointmentRescheduled;
use App\Events\ConsultationCompleted;
use App\Events\DocumentShared;
use App\Events\PaymentReceived;
use App\Events\PrescriptionCreated;
use App\Events\StockAlertTriggered;
use App\Models\DoctorPatientLink;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * SendNotificationListener
 *
 * Queued listener that handles all notification events and dispatches
 * push notifications via the NotificationService.
 *
 * Implements ShouldQueue so notifications don't block the main request.
 */
class SendNotificationListener implements ShouldQueue
{
    /**
     * The queue to use for this listener.
     */
    public string $queue = 'notifications';

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 3;

    public function __construct(
        private readonly NotificationService $notificationService,
    ) {}

    // ── Event Handlers ──────────────────────────────────────────────────────

    public function handleAppointmentBooked(AppointmentBooked $event): void
    {
        $appointment = $event->appointment;
        $appointment->loadMissing('patient:id,nom_complet');

        $data = [
            'id'           => $appointment->id,
            'date'         => $appointment->date_rdv?->format('d/m/Y') ?? '',
            'heure'        => $appointment->heure_debut ?? '',
            'patient_name' => $appointment->patient?->nom_complet ?? 'Patient',
        ];

        $this->notificationService->appointmentBooked($appointment->tenant_id, $data);
    }

    public function handleAppointmentCancelled(AppointmentCancelled $event): void
    {
        $appointment = $event->appointment;
        $appointment->loadMissing('patient:id,nom_complet');

        // Find patient app user account
        $patientUser = $this->findPatientUser($appointment->patient_id);

        $data = [
            'id'           => $appointment->id,
            'date'         => $appointment->date_rdv?->format('d/m/Y') ?? '',
            'patient_name' => $appointment->patient?->nom_complet ?? 'Patient',
        ];

        if ($patientUser) {
            $this->notificationService->appointmentCancelled($patientUser, $appointment->tenant_id, $data);
        } else {
            // No patient app account — only notify staff
            $this->notificationService->sendToTenant(
                $appointment->tenant_id,
                'appointment_cancelled',
                'Rendez-vous annulé',
                "Le rendez-vous de {$data['patient_name']} du {$data['date']} a été annulé.",
                ['appointment_id' => $appointment->id],
            );
        }
    }

    public function handleAppointmentRescheduled(AppointmentRescheduled $event): void
    {
        $appointment = $event->appointment;
        $patientUser = $this->findPatientUser($appointment->patient_id);

        if ($patientUser) {
            $this->notificationService->appointmentRescheduled($patientUser, [
                'id'         => $appointment->id,
                'new_date'   => $appointment->date_rdv?->format('d/m/Y') ?? '',
                'new_heure'  => $appointment->heure_debut ?? '',
            ]);
        }
    }

    public function handleConsultationCompleted(ConsultationCompleted $event): void
    {
        $consultation = $event->consultation;
        $patientUser = $this->findPatientUser($consultation->patient_id);

        if ($patientUser) {
            $this->notificationService->consultationCompleted($patientUser, [
                'id' => $consultation->id,
            ]);
        }
    }

    public function handlePrescriptionCreated(PrescriptionCreated $event): void
    {
        $prescription = $event->prescription;
        $patientUser = $this->findPatientUser($prescription->patient_id);

        if ($patientUser) {
            $this->notificationService->prescriptionReady($patientUser, [
                'id' => $prescription->id,
            ]);
        }
    }

    public function handlePaymentReceived(PaymentReceived $event): void
    {
        $payment = $event->payment;
        $payment->loadMissing('patient:id,nom_complet');
        $patientUser = $this->findPatientUser($payment->patient_id);

        $data = [
            'id'           => $payment->id,
            'montant'      => $payment->montant ?? 0,
            'patient_name' => $payment->patient?->nom_complet ?? 'Patient',
        ];

        if ($patientUser) {
            $this->notificationService->paymentReceived($patientUser, $payment->tenant_id, $data);
        } else {
            $this->notificationService->sendToTenant(
                $payment->tenant_id,
                'payment_received',
                'Paiement enregistré',
                "Paiement de " . number_format($data['montant'], 2, ',', ' ') . " MAD reçu.",
                ['payment_id' => $payment->id],
            );
        }
    }

    public function handleDocumentShared(DocumentShared $event): void
    {
        $this->notificationService->documentShared($event->patient, [
            'id'   => $event->documentId,
            'type' => $event->documentType,
        ]);
    }

    public function handleStockAlert(StockAlertTriggered $event): void
    {
        $medication = $event->medication;

        $this->notificationService->stockAlert($medication->tenant_id, [
            'id'              => $medication->id,
            'nom'             => $medication->nom ?? '',
            'stock_actuel'    => $medication->stock_actuel ?? 0,
            'seuil_alerte'    => $medication->seuil_alerte ?? 0,
            'date_expiration' => $medication->date_expiration?->format('d/m/Y') ?? '',
            'alert_type'      => $event->alertType,
        ]);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Find the patient's app user account via DoctorPatientLink.
     */
    private function findPatientUser(int $patientId): ?User
    {
        $link = DoctorPatientLink::where('patient_id', $patientId)
            ->where('statut', 'approved')
            ->whereNotNull('patient_account_id')
            ->first();

        if (!$link || !$link->patient_account_id) {
            return null;
        }

        return User::find($link->patient_account_id);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Notification listener failed', [
            'message' => $exception->getMessage(),
            'trace'   => $exception->getTraceAsString(),
        ]);
    }
}
