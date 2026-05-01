<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Models\DoctorPatientLink;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Console\Command;

/**
 * SendAppointmentReminders
 *
 * Scheduled command to send push notification reminders
 * for upcoming appointments (24h and 1h before).
 *
 * Schedule: Run every 15 minutes via Laravel Scheduler.
 */
class SendAppointmentReminders extends Command
{
    protected $signature = 'notifications:appointment-reminders {--hours=24 : Hours before appointment}';

    protected $description = 'Send push notification reminders for upcoming appointments';

    public function handle(NotificationService $notificationService): int
    {
        $hoursAhead = (int) $this->option('hours');
        $windowStart = now()->addHours($hoursAhead)->startOfMinute();
        $windowEnd = $windowStart->copy()->addMinutes(15);

        $this->info("Checking appointments between {$windowStart->format('H:i')} and {$windowEnd->format('H:i')} on {$windowStart->format('d/m/Y')}...");

        $appointments = Appointment::query()
            ->where('statut', 'confirme')
            ->whereDate('date_rdv', $windowStart->toDateString())
            ->whereTime('heure_debut', '>=', $windowStart->format('H:i:s'))
            ->whereTime('heure_debut', '<', $windowEnd->format('H:i:s'))
            ->with('patient:id,nom_complet')
            ->get();

        $sent = 0;

        foreach ($appointments as $appointment) {
            // Find patient app user via DoctorPatientLink
            $link = DoctorPatientLink::where('patient_id', $appointment->patient_id)
                ->where('doctor_id', $appointment->tenant_id)
                ->where('statut', 'approved')
                ->whereNotNull('patient_account_id')
                ->first();

            if ($link && $link->patient_account_id) {
                $patientUser = User::find($link->patient_account_id);

                if ($patientUser) {
                    $notificationService->appointmentReminder($patientUser, [
                        'id'    => $appointment->id,
                        'date'  => $appointment->date_rdv?->format('d/m/Y') ?? '',
                        'heure' => $appointment->heure_debut ?? '',
                    ]);
                    $sent++;
                }
            }

            // Also remind the doctor/staff
            $notificationService->sendToTenant(
                $appointment->tenant_id,
                'appointment_reminder',
                'Rappel de rendez-vous',
                "{$appointment->patient?->nom_complet} — rendez-vous à {$appointment->heure_debut}",
                ['appointment_id' => $appointment->id],
            );
            $sent++;
        }

        $this->info("✅ Sent {$sent} appointment reminders.");

        return self::SUCCESS;
    }
}
