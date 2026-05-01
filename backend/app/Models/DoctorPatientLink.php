<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DoctorPatientLink extends Model
{
    protected $fillable = [
        'tenant_id',
        'patient_record_id',
        'patient_account_id',
        'statut',
        'consent_at',
        'scenario',
    ];

    protected function casts(): array
    {
        return [
            'consent_at' => 'datetime',
        ];
    }

    // ── Scopes ──────────────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('statut', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('statut', 'approved');
    }

    // ── Relationships ───────────────────────────────────────────────────

    /** The doctor (tenant) */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    /** The patient record in the doctor's system */
    public function patientRecord(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_record_id');
    }

    /** The patient's app account */
    public function patientAccount(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_account_id');
    }

    /** Per-doctor permissions controlled by patient */
    public function permissions(): HasOne
    {
        return $this->hasOne(PatientPermission::class, 'link_id');
    }
}
