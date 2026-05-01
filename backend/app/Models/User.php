<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'tenant_id',
        'nom_complet',
        'nom_arabe',
        'adresse',
        'adresse_arabe',
        'telephone',
        'specialite',
        'inpe',
        'logo_path',
        'tampon_path',
        'ordonnance_header',
        'ordonnance_footer',
        'consultation_duration',
        'prix_consultation_defaut',
        'working_hours',
        'language',
        'notifications_enabled',
        'onesignal_player_id',
        'active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'        => 'datetime',
            'password'                 => 'hashed',
            'working_hours'            => 'array',
            'notifications_enabled'    => 'boolean',
            'two_factor_enabled'       => 'boolean',
            'active'                   => 'boolean',
            'prix_consultation_defaut' => 'decimal:2',
        ];
    }

    // ── JWT Interface ──────────────────────────────────────────────────────

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'role'      => $this->role,
            'tenant_id' => $this->tenant_id ?? $this->id,
        ];
    }

    // ── Relationships ──────────────────────────────────────────────────────

    /** All patients registered under this doctor */
    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class, 'tenant_id');
    }

    /** Secretaries who work for this doctor */
    public function secretaries(): HasMany
    {
        return $this->hasMany(User::class, 'tenant_id')
            ->where('role', UserRole::SECRETARY->value);
    }

    /** The doctor this secretary works for */
    public function doctor(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    /** Appointments under this doctor (tenant) */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'tenant_id');
    }

    /** Consultations under this doctor (tenant) */
    public function consultations(): HasMany
    {
        return $this->hasMany(Consultation::class, 'tenant_id');
    }

    /** Doctor-patient links (for patient app accounts) */
    public function doctorLinks(): HasMany
    {
        return $this->hasMany(DoctorPatientLink::class, 'patient_account_id');
    }

    /** Push notifications for this user */
    public function notifications(): HasMany
    {
        return $this->hasMany(PushNotification::class);
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    public function isDoctor(): bool
    {
        return $this->role === UserRole::DOCTOR->value;
    }

    public function isSecretary(): bool
    {
        return $this->role === UserRole::SECRETARY->value;
    }

    public function isPatient(): bool
    {
        return $this->role === UserRole::PATIENT->value;
    }

    /** Returns the effective tenant_id for this user */
    public function effectiveTenantId(): int
    {
        return $this->isDoctor() ? $this->id : (int) $this->tenant_id;
    }
}
