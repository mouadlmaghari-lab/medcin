<?php

use App\Http\Controllers\Api\V1\Assistant\AppointmentController;
use App\Http\Controllers\Api\V1\Assistant\PatientController;
use App\Http\Controllers\Api\V1\Assistant\PaymentController;
use App\Http\Controllers\Api\V1\Assistant\ExpenseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Assistant API — 4 modules ONLY
|--------------------------------------------------------------------------
| Secretary has NO access to: consultations, prescriptions, certificates,
| reports, expertises, or statistics.
*/

// Appointments (Rendez-vous)
Route::apiResource('appointments', AppointmentController::class);

// Patients — limited fields, no medical history
Route::apiResource('patients', PatientController::class)->only(['index', 'show', 'store', 'update']);

// Payments (Règlements)
Route::apiResource('payments', PaymentController::class);

// Expenses (Dépenses)
Route::apiResource('expenses', ExpenseController::class);
