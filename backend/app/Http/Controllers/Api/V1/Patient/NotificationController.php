<?php

namespace App\Http\Controllers\Api\V1\Patient;

use App\Http\Controllers\Controller;
use App\Models\PushNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * NotificationController (Patient Mobile)
 *
 * Patient notification center for the mobile app.
 * Read-only access + device token management.
 */
class NotificationController extends Controller
{
    /**
     * GET /notifications
     * List notifications for the authenticated patient.
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = PushNotification::where('user_id', $request->user()->id)
            ->when($request->type, fn ($q, $type) => $q->forType($type))
            ->when($request->boolean('unread_only'), fn ($q) => $q->unread())
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return response()->json($notifications);
    }

    /**
     * GET /notifications/unread-count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = PushNotification::where('user_id', $request->user()->id)
            ->unread()
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    /**
     * PATCH /notifications/{notification}/read
     */
    public function markAsRead(Request $request, PushNotification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notification marquée comme lue.']);
    }

    /**
     * PATCH /notifications/read-all
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        PushNotification::where('user_id', $request->user()->id)
            ->unread()
            ->update(['lu' => true]);

        return response()->json(['message' => 'Toutes les notifications marquées comme lues.']);
    }

    /**
     * POST /notifications/device-token
     * Register OneSignal player ID from mobile device.
     */
    public function updateDeviceToken(Request $request): JsonResponse
    {
        $request->validate([
            'player_id' => 'required|string|max:255',
        ]);

        $request->user()->update([
            'onesignal_player_id' => $request->player_id,
        ]);

        return response()->json(['message' => 'Token appareil enregistré.']);
    }

    /**
     * DELETE /notifications/device-token
     */
    public function removeDeviceToken(Request $request): JsonResponse
    {
        $request->user()->update([
            'onesignal_player_id' => null,
        ]);

        return response()->json(['message' => 'Token appareil supprimé.']);
    }
}
