<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ── Scheduled Tasks ──────────────────────────────────────────────────────

// Audit log cleanup: remove entries older than 5 years (Moroccan Law 05-20)
Schedule::command('audit:cleanup')->monthly()->at('03:00');

// Spatie Activitylog built-in cleanup (respects config retention period)
Schedule::command('activitylog:clean')->monthly()->at('03:30');

// ── Notification Scheduled Tasks ─────────────────────────────────────────

// Appointment reminders: 24h before
Schedule::command('notifications:appointment-reminders --hours=24')
    ->everyFifteenMinutes()
    ->between('6:00', '22:00');

// Appointment reminders: 1h before
Schedule::command('notifications:appointment-reminders --hours=1')
    ->everyFifteenMinutes()
    ->between('6:00', '22:00');

// Stock alerts: check daily at 8 AM
Schedule::command('notifications:stock-alerts')->dailyAt('08:00');
