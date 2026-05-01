<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class MedicalReport extends Model implements HasMedia
{
    use BelongsToTenant, HasFactory, InteractsWithMedia, LogsActivity;

    protected $fillable = [
        'tenant_id',
        'patient_id',
        'titre',
        'contenu',
        'date_rapport',
        'partage_patient',
        'pdf_path',
    ];

    protected function casts(): array
    {
        return [
            'date_rapport'    => 'date',
            'partage_patient' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('medical_report');
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
}
