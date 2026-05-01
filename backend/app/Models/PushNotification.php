<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PushNotification extends Model
{
    /**
     * Table was renamed from push_notifications → notifications.
     */
    protected $table = 'notifications';

    protected $fillable = [
        'user_id',
        'type',
        'titre',
        'body',
        'data',
        'channel',
        'lu',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'data'    => 'array',
            'lu'      => 'boolean',
            'sent_at' => 'datetime',
        ];
    }

    // ── Valid Notification Types ─────────────────────────────────────────

    public const TYPES = [
        'appointment_reminder',
        'appointment_booked',
        'appointment_cancelled',
        'appointment_rescheduled',
        'prescription_ready',
        'consultation_completed',
        'document_shared',
        'payment_received',
        'stock_alert',
        'system_announcement',
    ];

    public const CHANNELS = ['push', 'sms', 'email', 'in_app'];

    // ── Scopes ──────────────────────────────────────────────────────────

    public function scopeUnread($query)
    {
        return $query->where('lu', false);
    }

    public function scopeForType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForChannel($query, string $channel)
    {
        return $query->where('channel', $channel);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // ── Relationships ───────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    public function markAsRead(): self
    {
        $this->update(['lu' => true]);

        return $this;
    }
}
