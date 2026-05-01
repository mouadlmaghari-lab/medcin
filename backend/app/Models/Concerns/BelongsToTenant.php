<?php

namespace App\Models\Concerns;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Model;

/**
 * Trait BelongsToTenant
 *
 * Add to any model that should be scoped to a specific doctor/tenant.
 * Automatically applies tenant_id filtering on all queries and sets
 * tenant_id on create from the current request context.
 *
 * Usage:
 *   use BelongsToTenant;
 */
trait BelongsToTenant
{
    /**
     * Boot the trait: register the global TenantScope and set tenant_id on create.
     */
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope());

        static::creating(function (Model $model) {
            if (! $model->tenant_id && app()->has('current.tenant_id')) {
                $model->tenant_id = app('current.tenant_id');
            }
        });
    }

    /**
     * Get the tenant (doctor/user) that owns this record.
     */
    public function tenant(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'tenant_id');
    }
}
