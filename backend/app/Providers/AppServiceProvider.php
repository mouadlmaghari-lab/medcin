<?php

namespace App\Providers;

use App\Services\Media\MediaService;
use App\Services\NotificationService;
use App\Services\PdfService;
use App\Services\TwoFactorService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register MediaService as a singleton — shared instance, no repeated instantiation
        $this->app->singleton(MediaService::class, function ($app) {
            return new MediaService();
        });

        // Alias for convenience: app('media') or inject MediaService
        $this->app->alias(MediaService::class, 'media');

        // Register PdfService as singleton — one instance, inject anywhere
        $this->app->singleton(PdfService::class, function ($app) {
            return new PdfService();
        });
        $this->app->alias(PdfService::class, 'pdf');

        // Register TwoFactorService as singleton
        $this->app->singleton(TwoFactorService::class, function ($app) {
            return new TwoFactorService();
        });

        // Register NotificationService as singleton
        $this->app->singleton(NotificationService::class, function ($app) {
            return new NotificationService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS in production for all generated URLs
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        // ── Rate Limiters ────────────────────────────────────────────────────
        // General API: 60 requests/minute per user or IP
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)
                ->by($request->user()?->id ?: $request->ip());
        });

        // Auth endpoints: 5 attempts/minute to prevent brute-force
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->input('email') . '|' . $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Trop de tentatives. Réessayez dans une minute.',
                    ], 429);
                });
        });

        // PDF generation: 20/minute to prevent abuse
        RateLimiter::for('pdf', function (Request $request) {
            return Limit::perMinute(20)
                ->by($request->user()?->id ?: $request->ip());
        });

        // Ensure Spatie Permission works with multiple guards (web + api for JWT patients)
        // Configuration in config/permission.php handles guard registration
    }
}
