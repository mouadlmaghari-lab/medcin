<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Prescription extends Model implements HasMedia
{
    use BelongsToTenant, HasFactory, InteractsWithMedia, LogsActivity;

    protected $fillable = [
        'tenant_id',
        'patient_id',
        'consultation_id',
        'date_ordonnance',
        'notes',
        'numero',
        'pdf_path',
        'is_template',
        'template_name',
    ];

    protected function casts(): array
    {
        return [
            'date_ordonnance' => 'date',
            'is_template'     => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('prescription');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('pdf')
            ->singleFile()
            ->useDisk('s3');
    }

    // ── Scopes ──────────────────────────────────────────────────────────

    public function scopeTemplates($query)
    {
        return $query->where('is_template', true);
    }

    // ── Relationships ───────────────────────────────────────────────────

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PrescriptionItem::class)->orderBy('ordre');
    }
}
