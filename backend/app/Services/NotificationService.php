<?php

namespace App\Services;

use App\Models\PushNotification;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * NotificationService
 *
 * Manages push notifications via OneSignal REST API and stores
 * notification records in the database for in-app notification center.
 *
 * 10 Notification Types:
 *   1. appointment_reminder    — Upcoming appointment reminder (patient + doctor)
 *   2. appointment_booked      — New appointment booked (doctor/assistant)
 *   3. appointment_cancelled   — Appointment cancelled (patient + doctor)
 *   4. appointment_rescheduled — Appointment rescheduled (patient)
 *   5. prescription_ready      — New prescription available (patient)
 *   6. consultation_completed  — Consultation summary ready (patient)
 *   7. document_shared         — Document shared with patient (patient)
 *   8. payment_received        — Payment confirmation (patient + doctor)
 *   9. stock_alert             — Low stock or expiring medication (doctor)
 *  10. system_announcement     — System-wide announcements (all)
 */
class NotificationService
{
    private string $appId;
    private string $restKey;
    private string $apiUrl;

    public function __construct()
    {
        $this->appId = config('services.onesignal.app_id', '');
        $this->restKey = config('services.onesignal.rest_key', '');
        $this->apiUrl = config('services.onesignal.api_url', 'https://onesignal.com/api/v1');
    }

    // ── Public API ──────────────────────────────────────────────────────────

    /**
     * Send a notification to a specific user.
     */
    public function sendToUser(User $user, string $type, string $title, string $body, array $data = []): ?PushNotification
    {
        // Check if user has notifications enabled
        if (!$user->notifications_enabled) {
            return null;
        }

        // Store in database (in-app notification)
        $notification = $this->store($user, $type, $title, $body, $data);

        // Send via OneSignal push (if player_id exists)
        if ($user->onesignal_player_id) {
            $this->sendPush(
                playerIds: [$user->onesignal_player_id],
                title: $title,
                body: $body,
                data: array_merge($data, [
                    'type'            => $type,
                    'notification_id' => $notification->id,
                ]),
            );
        }

        return $notification;
    }

    /**
     * Send a notification to multiple users.
     */
    public function sendToUsers(array $users, string $type, string $title, string $body, array $data = []): array
    {
        $notifications = [];
        $playerIds = [];

        foreach ($users as $user) {
            if (!$user instanceof User) {
                continue;
            }

            if (!$user->notifications_enabled) {
                continue;
            }

            // Store in database
            $notifications[] = $this->store($user, $type, $title, $body, $data);

            if ($user->onesignal_player_id) {
                $playerIds[] = $user->onesignal_player_id;
            }
        }

        // Batch push via OneSignal
        if (!empty($playerIds)) {
            $this->sendPush(
                playerIds: $playerIds,
                title: $title,
                body: $body,
                data: array_merge($data, ['type' => $type]),
            );
        }

        return $notifications;
    }

    /**
     * Send notification to all users of a specific tenant (doctor + assistants).
     */
    public function sendToTenant(int $tenantId, string $type, string $title, string $body, array $data = []): array
    {
        $users = User::where('id', $tenantId)
            ->orWhere('tenant_id', $tenantId)
            ->where('notifications_enabled', true)
            ->get();

        return $this->sendToUsers($users->all(), $type, $title, $body, $data);
    }

    // ── Convenience Methods (10 Event Types) ────────────────────────────────

    /**
     * 1. Appointment reminder — sent to patient X hours before.
     */
    public function appointmentReminder(User $user, array $appointment): ?PushNotification
    {
        return $this->sendToUser(
            $user,
            'appointment_reminder',
            'Rappel de rendez-vous',
            "Vous avez un rendez-vous le {$appointment['date']} à {$appointment['heure']}.",
            ['appointment_id' => $appointment['id']],
        );
    }

    /**
     * 2. Appointment booked — sent to doctor/assistant.
     */
    public function appointmentBooked(int $tenantId, array $appointment): array
    {
        $patientName = $appointment['patient_name'] ?? 'Patient';

        return $this->sendToTenant(
            $tenantId,
            'appointment_booked',
            'Nouveau rendez-vous',
            "{$patientName} a réservé un rendez-vous le {$appointment['date']}.",
            ['appointment_id' => $appointment['id']],
        );
    }

    /**
     * 3. Appointment cancelled — sent to patient + doctor.
     */
    public function appointmentCancelled(User $patient, int $tenantId, array $appointment): array
    {
        $notifications = [];

        // Notify patient
        $n = $this->sendToUser(
            $patient,
            'appointment_cancelled',
            'Rendez-vous annulé',
            "Votre rendez-vous du {$appointment['date']} a été annulé.",
            ['appointment_id' => $appointment['id']],
        );
        if ($n) {
            $notifications[] = $n;
        }

        // Notify doctor/staff
        $staffNotifications = $this->sendToTenant(
            $tenantId,
            'appointment_cancelled',
            'Rendez-vous annulé',
            "Le rendez-vous de {$appointment['patient_name']} du {$appointment['date']} a été annulé.",
            ['appointment_id' => $appointment['id']],
        );

        return array_merge($notifications, $staffNotifications);
    }

    /**
     * 4. Appointment rescheduled — sent to patient.
     */
    public function appointmentRescheduled(User $patient, array $appointment): ?PushNotification
    {
        return $this->sendToUser(
            $patient,
            'appointment_rescheduled',
            'Rendez-vous modifié',
            "Votre rendez-vous a été déplacé au {$appointment['new_date']} à {$appointment['new_heure']}.",
            ['appointment_id' => $appointment['id']],
        );
    }

    /**
     * 5. Prescription ready — sent to patient.
     */
    public function prescriptionReady(User $patient, array $prescription): ?PushNotification
    {
        return $this->sendToUser(
            $patient,
            'prescription_ready',
            'Nouvelle ordonnance',
            'Une nouvelle ordonnance est disponible dans votre espace patient.',
            ['prescription_id' => $prescription['id']],
        );
    }

    /**
     * 6. Consultation completed — sent to patient.
     */
    public function consultationCompleted(User $patient, array $consultation): ?PushNotification
    {
        return $this->sendToUser(
            $patient,
            'consultation_completed',
            'Consultation terminée',
            'Le compte rendu de votre consultation est disponible.',
            ['consultation_id' => $consultation['id']],
        );
    }

    /**
     * 7. Document shared — sent to patient.
     */
    public function documentShared(User $patient, array $document): ?PushNotification
    {
        $docType = $document['type'] ?? 'document';

        return $this->sendToUser(
            $patient,
            'document_shared',
            'Nouveau document',
            "Un {$docType} a été partagé avec vous.",
            ['document_id' => $document['id'], 'document_type' => $docType],
        );
    }

    /**
     * 8. Payment received — sent to patient + doctor.
     */
    public function paymentReceived(User $patient, int $tenantId, array $payment): array
    {
        $amount = number_format($payment['montant'], 2, ',', ' ');
        $notifications = [];

        // Notify patient
        $n = $this->sendToUser(
            $patient,
            'payment_received',
            'Paiement reçu',
            "Votre paiement de {$amount} MAD a été enregistré.",
            ['payment_id' => $payment['id']],
        );
        if ($n) {
            $notifications[] = $n;
        }

        // Notify doctor
        $staffNotifications = $this->sendToTenant(
            $tenantId,
            'payment_received',
            'Paiement enregistré',
            "Paiement de {$amount} MAD reçu de {$payment['patient_name']}.",
            ['payment_id' => $payment['id']],
        );

        return array_merge($notifications, $staffNotifications);
    }

    /**
     * 9. Stock alert — sent to doctor (low stock or expiring medication).
     */
    public function stockAlert(int $tenantId, array $medication): array
    {
        $alertType = $medication['alert_type'] ?? 'low_stock';
        $title = $alertType === 'expiring'
            ? 'Médicament bientôt expiré'
            : 'Stock bas';
        $body = $alertType === 'expiring'
            ? "{$medication['nom']} expire le {$medication['date_expiration']}."
            : "{$medication['nom']} : stock restant {$medication['stock_actuel']} (seuil: {$medication['seuil_alerte']}).";

        return $this->sendToTenant(
            $tenantId,
            'stock_alert',
            $title,
            $body,
            ['medication_id' => $medication['id'], 'alert_type' => $alertType],
        );
    }

    /**
     * 10. System announcement — broadcast to all or specific segment.
     */
    public function systemAnnouncement(string $title, string $body, array $data = []): void
    {
        // Use OneSignal segments for broadcast (no per-user DB record)
        $this->sendPushToSegment('All', $title, $body, array_merge($data, ['type' => 'system_announcement']));
    }

    // ── Private Helpers ─────────────────────────────────────────────────────

    /**
     * Store a notification record in the database.
     */
    private function store(User $user, string $type, string $title, string $body, array $data): PushNotification
    {
        return PushNotification::create([
            'user_id' => $user->id,
            'type'    => $type,
            'titre'   => $title,
            'body'    => $body,
            'data'    => $data,
            'channel' => 'push',
            'lu'      => false,
            'sent_at' => now(),
        ]);
    }

    /**
     * Send push notification via OneSignal REST API to specific player IDs.
     */
    private function sendPush(array $playerIds, string $title, string $body, array $data = []): bool
    {
        if (empty($this->appId) || empty($this->restKey)) {
            Log::warning('OneSignal not configured — push notification skipped.', [
                'title' => $title,
                'player_ids' => $playerIds,
            ]);

            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => "Basic {$this->restKey}",
                'Content-Type'  => 'application/json',
            ])->post("{$this->apiUrl}/notifications", [
                'app_id'             => $this->appId,
                'include_player_ids' => $playerIds,
                'headings'           => ['fr' => $title, 'en' => $title],
                'contents'           => ['fr' => $body, 'en' => $body],
                'data'               => $data,
                'ios_badgeType'      => 'Increase',
                'ios_badgeCount'     => 1,
                'android_channel_id' => 'tabibcare_default',
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error('OneSignal push failed', [
                'status'  => $response->status(),
                'body'    => $response->json(),
                'title'   => $title,
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('OneSignal push exception', [
                'message' => $e->getMessage(),
                'title'   => $title,
            ]);

            return false;
        }
    }

    /**
     * Send push notification to a OneSignal segment (broadcast).
     */
    private function sendPushToSegment(string $segment, string $title, string $body, array $data = []): bool
    {
        if (empty($this->appId) || empty($this->restKey)) {
            Log::warning('OneSignal not configured — segment push skipped.');

            return false;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => "Basic {$this->restKey}",
                'Content-Type'  => 'application/json',
            ])->post("{$this->apiUrl}/notifications", [
                'app_id'            => $this->appId,
                'included_segments' => [$segment],
                'headings'          => ['fr' => $title, 'en' => $title],
                'contents'          => ['fr' => $body, 'en' => $body],
                'data'              => $data,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('OneSignal segment push exception', ['message' => $e->getMessage()]);

            return false;
        }
    }
}
