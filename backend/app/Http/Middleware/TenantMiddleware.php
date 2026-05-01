<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * TenantMiddleware
 *
 * Resolves the current tenant_id from the authenticated user and binds it
 * into the application container so TenantScope can use it on every query.
 *
 * For doctor/assistant roles: tenant_id = user's own id (they ARE the tenant).
 * For patient role: no tenant_id set — patient API uses its own permission layer.
 *
 * Must be applied after auth middleware (Sanctum/JWT must have run first).
 */
class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasAnyRole(['doctor', 'secretary'])) {
            // Doctors and secretaries work within their own tenant (practice)
            $tenantId = $user->hasRole('doctor')
                ? $user->id
                : $user->tenant_id; // Secretary's tenant is the doctor they work for

            app()->instance('current.tenant_id', $tenantId);
        }

        return $next($request);
    }
}
