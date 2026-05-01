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

class Expertise extends Model implements HasMedia
{
    use BelongsToTenant, HasFactory, InteractsWithMedia, LogsActivity;

    protected $fillable = [
        'tenant_id',
        'patient_id',
        'titre',
        'contenu',
        'date_expertise',
        'statut',
        'pdf_path',
    ];

    protected function casts(): array
    {
        return [
            'date_expertise' => 'date',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('expertise');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('pdf')
            ->singleFile()
            ->useDisk('s3');

        $this->addMediaCollection('attachments')
            ->useDisk('s3');
    }

    // ── Scopes ──────────────────────────────────────────────────────────

    public function scopeEnCours($query)
    {
        return $query->where('statut', 'en_cours');
    }

    public function scopeTermine($query)
    {
        return $query->where('statut', 'termine');
    }

    // ── Relationships ───────────────────────────────────────────────────

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ExpertiseAttachment::class);
    }
}
