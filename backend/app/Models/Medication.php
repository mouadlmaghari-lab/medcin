<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Medication extends Model
{
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'tenant_id',
        'nom',
        'nom_generique',
        'categorie',
        'forme',
        'unite',
        'prix_achat',
        'prix_vente',
        'stock_qty',
        'stock_alerte_min',
        'date_expiration',
        'code_barre',
        'notes',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'prix_achat'      => 'decimal:2',
            'prix_vente'      => 'decimal:2',
            'date_expiration' => 'date',
            'active'          => 'boolean',
        ];
    }

    // ── Scopes ──────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock_qty', '<=', 'stock_alerte_min');
    }

    public function scopeExpiringSoon($query, int $days = 30)
    {
        return $query->whereNotNull('date_expiration')
            ->where('date_expiration', '<=', now()->addDays($days));
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    public function isLowStock(): bool
    {
        return $this->stock_qty <= $this->stock_alerte_min;
    }

    public function isExpired(): bool
    {
        return $this->date_expiration && $this->date_expiration->isPast();
    }
}
