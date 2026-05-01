<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpertiseAttachment extends Model
{
    protected $fillable = [
        'expertise_id',
        'file_path',
        'file_name',
        'media_type',
        'file_size',
    ];

    public function expertise(): BelongsTo
    {
        return $this->belongsTo(Expertise::class);
    }
}
