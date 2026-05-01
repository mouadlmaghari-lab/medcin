<?php

use App\Http\Controllers\Api\V1\Doctor\TwoFactorController;
use Illuminate\Support\Facades\Route;

// 2FA Management Routes
Route::get('/status',    [TwoFactorController::class, 'status'])->name('status');
Route::post('/setup',    [TwoFactorController::class, 'setup'])->name('setup');
Route::post('/confirm',  [TwoFactorController::class, 'confirm'])->name('confirm');
Route::post('/verify',   [TwoFactorController::class, 'verify'])->name('verify');
Route::delete('/disable', [TwoFactorController::class, 'disable'])->name('disable');
