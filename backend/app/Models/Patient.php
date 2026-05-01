<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Patient extends Model implements HasMedia
{
    use BelongsToTenant,
        HasFactory,
        InteractsWithMedia,
        LogsActivity,
        Searchable,
        SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'patient_account_id',
        'cin',
        'nom_complet',
        'date_naissance',
        'lieu_naissance',
        'ville',
        'profession',
        'date_inscription',
        'genre',
        'telephone',
        'adresse',
        'email',
        'type_couverture',
        'observation',
        'type_dossier',
        'id_dossier',
        'numero_dossier',
        'type',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'date_naissance'   => 'date',
            'date_inscription' => 'date',
            'active'           => 'boolean',
        ];
    }

    // ── Scout / Meilisearch ─────────────────────────────────────────────────

    public function toSearchableArray(): array
    {
        return [
            'id'             => $this->id,
            'nom_complet'    => $this->nom_complet,
            'telephone'      => $this->telephone,
            'cin'            => $this->cin,
            'numero_dossier' => $this->numero_dossier,
            'email'          => $this->email,
            'ville'          => $this->ville,
            'tenant_id'      => $this->tenant_id,
        ];
    }

    public function searchableAs(): string
    {
        return 'patients';
    }

    // ── Activity Log ───────────────────────────────────────────────────────

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('patient');
    }

    // ── Media Collections ──────────────────────────────────────────────────

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photo')
            ->singleFile()
            ->useDisk('s3');

        $this->addMediaCollection('analyses')
            ->acceptsMimeTypes(['application/pdf', 'image/jpeg', 'image/png'])
            ->useDisk('s3');
    }

    // ── Relationships ──────────────────────────────────────────────────────

    public function consultations(): HasMany
    {
        return $this->hasMany(Consultation::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function evolutions(): HasMany
    {
        return $this->hasMany(Evolution::class);
    }

    public function patientAccount(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_account_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function medicalReports(): HasMany
    {
        return $this->hasMany(MedicalReport::class);
    }

    public function expertises(): HasMany
    {
        return $this->hasMany(Expertise::class);
    }

    public function doctorLinks(): HasMany
    {
        return $this->hasMany(DoctorPatientLink::class, 'patient_record_id');
    }
}
