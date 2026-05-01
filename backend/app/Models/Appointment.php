<?php

namespace App\Models;

use App\Enums\AppointmentStatus;
use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Appointment extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'tenant_id', 'patient_id', 'created_by',
        'patient_name', 'telephone',
        'debut', 'fin', 'etat', 'description',
        'booking_source', 'reminder_sent_24h', 'reminder_sent_1h',
    ];

    protected function casts(): array
    {
        return [
            'debut'              => 'datetime',
            'fin'                => 'datetime',
            'reminder_sent_24h'  => 'boolean',
            'reminder_sent_1h'   => 'boolean',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function consultation(): HasOne
    {
        return $this->hasOne(Consultation::class);
    }

    public function isAvailable(): bool
    {
        return $this->etat === AppointmentStatus::Pending->value
            || $this->etat === AppointmentStatus::Confirmed->value;
    }
}
