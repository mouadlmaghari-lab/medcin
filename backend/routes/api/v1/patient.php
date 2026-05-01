<?php

use App\Http\Controllers\Api\V1\Patient\AuthController;
use App\Http\Controllers\Api\V1\Patient\AppointmentController;
use App\Http\Controllers\Api\V1\Patient\DocumentController;
use App\Http\Controllers\Api\V1\Patient\DoctorController;
use App\Http\Controllers\Api\V1\Patient\ProfileController;
use App\Http\Controllers\Api\V1\Patient\NotificationController;
use Illuminate\Support\Facades\Route;

// Profile
Route::get('/profile',              [ProfileController::class, 'show'])->name('profile.show');
Route::put('/profile',              [ProfileController::class, 'update'])->name('profile.update');
Route::get('/profile/permissions',  [ProfileController::class, 'permissions'])->name('profile.permissions');

// Connected doctors
Route::get('/doctors',                          [DoctorController::class, 'index'])->name('doctors.index');
Route::get('/doctors/{link}',                   [DoctorController::class, 'show'])->name('doctors.show');
Route::patch('/doctors/{link}/permissions',     [DoctorController::class, 'updatePermissions'])->name('doctors.permissions');
Route::delete('/doctors/{link}',                [DoctorController::class, 'revoke'])->name('doctors.revoke');

// Appointments (read-only from mobile)
Route::get('/appointments',                     [AppointmentController::class, 'index'])->name('appointments.index');
Route::get('/appointments/{appointment}',       [AppointmentController::class, 'show'])->name('appointments.show');

// Documents (shared consultations, reports)
Route::get('/documents',                        [DocumentController::class, 'index'])->name('docs.index');
Route::get('/documents/consultations/{consultation}', [DocumentController::class, 'showConsultation'])->name('docs.consultation');
Route::get('/documents/reports/{report}',       [DocumentController::class, 'showReport'])->name('docs.report');
Route::get('/documents/{id}/download',          [DocumentController::class, 'download'])->name('docs.download');

// Notifications (Patient mobile notification center)
Route::prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/',               [NotificationController::class, 'index'])->name('index');
    Route::get('/unread-count',   [NotificationController::class, 'unreadCount'])->name('unread-count');
    Route::patch('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('read');
    Route::patch('/read-all',     [NotificationController::class, 'markAllAsRead'])->name('read-all');
    Route::post('/device-token',  [NotificationController::class, 'updateDeviceToken'])->name('device-token');
    Route::delete('/device-token', [NotificationController::class, 'removeDeviceToken'])->name('device-token.remove');
});
