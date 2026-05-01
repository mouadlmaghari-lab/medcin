<?php

use App\Http\Middleware\AuditMedicalAccess;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\TenantMiddleware;
use App\Http\Middleware\Verify2FA;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Global middleware — security headers on every response
        $middleware->append(SecurityHeaders::class);

        // Alias for convenience in route files
        $middleware->alias([
            'tenant'             => TenantMiddleware::class,
            'audit.medical'      => AuditMedicalAccess::class,
            'verify.2fa'         => Verify2FA::class,
            'role'               => RoleMiddleware::class,
            'permission'         => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);

        // API rate limiting (Laravel built-in throttle: 60 requests/minute)
        $middleware->api(prepend: [
            \Illuminate\Routing\Middleware\ThrottleRequests::class . ':api',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON for API 404s
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Resource not found.',
                ], 404);
            }
        });
    })->create();
