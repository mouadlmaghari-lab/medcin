<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Expense extends Model implements HasMedia
{
    use BelongsToTenant, HasFactory, InteractsWithMedia;

    protected $fillable = [
        'tenant_id',
        'category_id',
        'description',
        'fournisseur',
        'montant',
        'date_depense',
        'notes',
        'receipt_path',
    ];

    protected function casts(): array
    {
        return [
            'montant'      => 'decimal:2',
            'date_depense' => 'date',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('receipts')
            ->singleFile()
            ->useDisk('s3');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }
}
