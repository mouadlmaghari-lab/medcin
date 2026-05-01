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

class Invoice extends Model implements HasMedia
{
    use BelongsToTenant, HasFactory, InteractsWithMedia, LogsActivity;

    protected $fillable = [
        'tenant_id',
        'patient_id',
        'consultation_id',
        'numero',
        'date_facture',
        'statut',
        'montant_ht',
        'tva',
        'montant_ttc',
        'pdf_path',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_facture' => 'date',
            'montant_ht'   => 'decimal:2',
            'tva'          => 'decimal:2',
            'montant_ttc'  => 'decimal:2',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->useLogName('invoice');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('pdf')
            ->singleFile()
            ->useDisk('s3');
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    /** Recalculate totals from items */
    public function recalculateTotals(): void
    {
        $ht = $this->items()->sum('montant');
        $tvaAmount = $ht * ($this->tva / 100);
        $this->update([
            'montant_ht'  => $ht,
            'montant_ttc' => $ht + $tvaAmount,
        ]);
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
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
