<?php

use App\Http\Controllers\Api\V1\Doctor\PatientController;
use App\Http\Controllers\Api\V1\Doctor\AppointmentController;
use App\Http\Controllers\Api\V1\Doctor\ConsultationController;
use App\Http\Controllers\Api\V1\Doctor\CertificateController;
use App\Http\Controllers\Api\V1\Doctor\PrescriptionController;
use App\Http\Controllers\Api\V1\Doctor\PaymentController;
use App\Http\Controllers\Api\V1\Doctor\InvoiceController;
use App\Http\Controllers\Api\V1\Doctor\MedicationController;
use App\Http\Controllers\Api\V1\Doctor\ExpenseController;
use App\Http\Controllers\Api\V1\Doctor\MedicalReportController;
use App\Http\Controllers\Api\V1\Doctor\ExpertiseController;
use App\Http\Controllers\Api\V1\Doctor\EvolutionController;
use App\Http\Controllers\Api\V1\Doctor\StatisticsController;
use App\Http\Controllers\Api\V1\Doctor\PdfController;
use App\Http\Controllers\Api\V1\Doctor\NotificationController;
use Illuminate\Support\Facades\Route;

// Patients
Route::apiResource('patients', PatientController::class);
Route::get('patients/{patient}/history', [PatientController::class, 'history'])->name('patients.history');

// Appointments / Agenda
Route::apiResource('appointments', AppointmentController::class);

// Consultations
// NOTE: validation-rules must be declared BEFORE apiResource to avoid Laravel
// treating the literal string "validation-rules" as a {consultation} parameter.
Route::get('consultations/validation-rules', [ConsultationController::class, 'validationRules'])->name('consultations.validation-rules');
Route::apiResource('consultations', ConsultationController::class);
Route::get('patients/{patient}/consultations', [ConsultationController::class, 'byPatient'])->name('consultations.by-patient');

// Certificates
Route::apiResource('certificates', CertificateController::class);

// Prescriptions (Ordonnances)
Route::apiResource('prescriptions', PrescriptionController::class);

// Payments (Règlements)
Route::apiResource('payments', PaymentController::class);

// Invoices (Factures)
Route::apiResource('invoices', InvoiceController::class);

// Medications & Stock
Route::apiResource('medications', MedicationController::class);

// Expenses (Dépenses)
Route::apiResource('expenses', ExpenseController::class);

// Medical Reports
Route::apiResource('reports', MedicalReportController::class);
Route::patch('reports/{report}/toggle-share', [MedicalReportController::class, 'toggleShare'])->name('reports.toggle-share');

// Expertises
Route::apiResource('expertises', ExpertiseController::class);
Route::delete('expertises/{expertise}/attachments/{attachment}', [ExpertiseController::class, 'deleteAttachment'])->name('expertises.attachments.destroy');

// Patient Evolution
Route::apiResource('patients.evolutions', EvolutionController::class)->shallow();

// Statistics (Dashboard + Trends)
Route::prefix('statistics')->name('statistics.')->group(function () {
    Route::get('/dashboard',      [StatisticsController::class, 'dashboard'])->name('dashboard');
    Route::get('/appointments',   [StatisticsController::class, 'appointmentTrends'])->name('appointments');
    Route::get('/revenue',        [StatisticsController::class, 'revenueTrends'])->name('revenue');
    Route::get('/top-procedures', [StatisticsController::class, 'topProcedures'])->name('top-procedures');
});

// Notifications (Doctor notification center)
Route::prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/',               [NotificationController::class, 'index'])->name('index');
    Route::get('/unread-count',   [NotificationController::class, 'unreadCount'])->name('unread-count');
    Route::patch('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('read');
    Route::patch('/read-all',     [NotificationController::class, 'markAllAsRead'])->name('read-all');
    Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('destroy');
    Route::post('/device-token',  [NotificationController::class, 'updateDeviceToken'])->name('device-token');
    Route::delete('/device-token', [NotificationController::class, 'removeDeviceToken'])->name('device-token.remove');
    Route::patch('/preferences',  [NotificationController::class, 'updatePreferences'])->name('preferences');
});

// PDF Generation (Stream / Download)
Route::prefix('pdf')->name('pdf.')->group(function () {
    Route::get('/ordonnance/{prescription}',   [PdfController::class, 'ordonnance'])->name('ordonnance');
    Route::get('/certificat/{certificate}',    [PdfController::class, 'certificat'])->name('certificat');
    Route::get('/facture/{invoice}',           [PdfController::class, 'facture'])->name('facture');
    Route::get('/recu/{payment}',              [PdfController::class, 'recu'])->name('recu');
    Route::get('/rapport/{report}',            [PdfController::class, 'rapport'])->name('rapport');
    Route::get('/consultation/{consultation}', [PdfController::class, 'consultation'])->name('consultation');
    Route::post('/download',                   [PdfController::class, 'downloadAny'])->name('download');
});
