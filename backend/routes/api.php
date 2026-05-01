<?php

use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\Auth\PatientAuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| TabibCare API — v1
|--------------------------------------------------------------------------
|
| Four API groups:
|   /api/v1/auth/*        — Doctor/secretary authentication (Sanctum)
|   /api/v1/auth/patient/ — Patient mobile authentication (JWT)
|   /api/v1/doctor/*      — Doctor (full access, tenant-scoped)
|   /api/v1/assistant/*   — Secretary (4 modules only, tenant-scoped)
|   /api/v1/patient/*     — Patient mobile app (permission-scoped, JWT)
|
*/

Route::prefix('v1')->group(function () {

    // ── Web Authentication — Doctor/Secretary (Sanctum) ────────────────────
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('/login',    [LoginController::class,    'login'])
            ->middleware('throttle:login')
            ->name('login');
        Route::post('/register', [RegisterController::class, 'register'])
            ->middleware('throttle:login')
            ->name('register');
        Route::middleware('auth:sanctum')->post('/logout', [LoginController::class, 'logout'])->name('logout');

        // ── Mobile Authentication — Patient (JWT) ──────────────────────────
        Route::prefix('patient')->name('patient.')->group(function () {
            Route::post('/register', [PatientAuthController::class, 'register'])
                ->middleware('throttle:login')
                ->name('register');
            Route::post('/login',    [PatientAuthController::class, 'login'])
                ->middleware('throttle:login')
                ->name('login');
            Route::post('/refresh',  [PatientAuthController::class, 'refresh'])->name('refresh');
            Route::middleware('auth:api')->post('/logout', [PatientAuthController::class, 'logout'])->name('logout');
        });
    });

    // ── Doctor API (Sanctum, tenant-scoped, audited) ───────────────────────
    Route::prefix('doctor')
        ->name('doctor.')
        ->middleware(['auth:sanctum', 'role:doctor', 'tenant', 'audit.medical'])
        ->group(base_path('routes/api/v1/doctor.php'));

    // ── 2FA Management (requires Sanctum auth, no tenant scope) ─────────
    Route::prefix('2fa')
        ->name('2fa.')
        ->middleware(['auth:sanctum', 'role:doctor'])
        ->group(base_path('routes/api/v1/twofactor.php'));

    // ── Assistant API (Sanctum, tenant-scoped, limited modules) ───────────
    Route::prefix('assistant')
        ->name('assistant.')
        ->middleware(['auth:sanctum', 'role:secretary', 'tenant'])
        ->group(base_path('routes/api/v1/assistant.php'));

    // ── Patient API (JWT, permission-scoped) ───────────────────────────────
    Route::prefix('patient')
        ->name('patient.')
        ->middleware(['auth:api'])                // tymon/jwt-auth guard
        ->group(base_path('routes/api/v1/patient.php'));
});
