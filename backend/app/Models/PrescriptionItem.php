<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrescriptionItem extends Model
{
    protected $fillable = [
        'prescription_id',
        'medication_id',
        'medication_name',
        'dosage',
        'frequence',
        'duree',
        'instructions',
        'ordre',
    ];

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    /** Optional link to medication catalog */
    public function medication(): BelongsTo
    {
        return $this->belongsTo(Medication::class);
    }
}
