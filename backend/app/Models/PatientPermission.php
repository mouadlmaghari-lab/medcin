<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientPermission extends Model
{
    protected $fillable = [
        'link_id',
        'partager_consultations',
        'partager_analyses',
        'voir_historique',
    ];

    protected function casts(): array
    {
        return [
            'partager_consultations' => 'boolean',
            'partager_analyses'      => 'boolean',
            'voir_historique'        => 'boolean',
        ];
    }

    public function link(): BelongsTo
    {
        return $this->belongsTo(DoctorPatientLink::class, 'link_id');
    }
}
