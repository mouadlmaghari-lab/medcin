<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id',
        'description',
        'quantity',
        'prix_unitaire',
        'montant',
    ];

    protected function casts(): array
    {
        return [
            'prix_unitaire' => 'decimal:2',
            'montant'       => 'decimal:2',
        ];
    }

    /** Auto-calculate montant on save */
    protected static function booted(): void
    {
        static::saving(function (InvoiceItem $item) {
            $item->montant = $item->quantity * $item->prix_unitaire;
        });
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
