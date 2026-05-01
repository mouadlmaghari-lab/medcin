<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * TenantScope
 *
 * Automatically filters all queries on tenant-scoped models by the
 * current tenant_id, which is resolved from the authenticated user
 * via TenantMiddleware and stored in the app container.
 *
 * IMPORTANT: Never call withoutGlobalScope(TenantScope::class) in
 * production code. This would bypass tenant isolation entirely.
 */
class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (app()->has('current.tenant_id')) {
            $builder->where($model->getTable().'.tenant_id', app('current.tenant_id'));
        }
    }
}
