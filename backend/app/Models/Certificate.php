<?php

namespace App\Models;

use App\Enums\CertificateType;
use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Certificate extends Model implements HasMedia
{
    use BelongsToTenant, HasFactory, InteractsWithMedia, LogsActivity;

    protected $fillable = [
        'tenant_id',
        'patient_id',
        'consultation_id',
        'date_certificat',
        'type',
        'date_debut',
        'date_fin',
        'nombre_jours',
        'contenu',
        'urgence',
        'numero',
        'pdf_path',
    ];

    protected function casts(): array
    {
        return [
            'type'            => CertificateType::class,
            'date_certificat' => 'date',
            'date_debut'      => 'date',
            'date_fin'        => 'date',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('certificate');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('pdf')
            ->singleFile()
            ->useDisk('s3');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }
}
