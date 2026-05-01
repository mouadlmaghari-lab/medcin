<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Consultation extends Model
{
    use BelongsToTenant, HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'patient_id', 'appointment_id', 'date_consultation',
        // Vitals
        'poids', 'taille', 'temperature', 'tension_arterielle',
        'saturation_o2', 'frequence_cardiaque', 'frequence_respiratoire',
        // Diabetology labs
        'glycemie', 'glycemie_a_jeun', 'glycemie_apres_repas', 'hba1c', 'glucagon',
        'tt', 'th', 'glogylie', 'glucosurie', 'acetone',
        // Lipid panel
        'cholesterol_total', 'triglycerides', 'hdl', 'ldl',
        // Clinical
        'examen_clinique', 'diagnostic', 'conduite_a_tenir',
        // Payment
        'prix', 'regle',
    ];

    protected function casts(): array
    {
        return [
            'date_consultation'      => 'date',
            'poids'                  => 'decimal:2',
            'temperature'            => 'decimal:2',
            'saturation_o2'          => 'decimal:2',
            'frequence_cardiaque'    => 'integer',
            'frequence_respiratoire' => 'integer',
            'glycemie'               => 'decimal:2',
            'glycemie_a_jeun'        => 'decimal:2',
            'glycemie_apres_repas'   => 'decimal:2',
            'hba1c'                  => 'decimal:2',
            'glucagon'               => 'decimal:2',
            'cholesterol_total'      => 'decimal:2',
            'triglycerides'          => 'decimal:2',
            'hdl'                    => 'decimal:2',
            'ldl'                    => 'decimal:2',
            'prix'                   => 'decimal:2',
            'regle'                  => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('consultation');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'patient_id', 'patient_id');
    }
}
