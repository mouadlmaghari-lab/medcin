<?php

namespace App\Http\Controllers\Api\V1\Doctor;

use App\Http\Controllers\Controller;
use App\Models\PushNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * NotificationController (Doctor)
 *
 * Manages the doctor's notification center — list, read, mark as read, clear.
 */
class NotificationController extends Controller
{
    /**
     * GET /notifications
     * List notifications for the authenticated user (paginated).
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
     * Get the count of unread notifications.
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
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, PushNotification $notification): JsonResponse
    {
        // Ownership check
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notification marquée comme lue.']);
    }

    /**
     * PATCH /notifications/read-all
     * Mark all notifications as read for the authenticated user.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        PushNotification::where('user_id', $request->user()->id)
            ->unread()
            ->update(['lu' => true]);

        return response()->json(['message' => 'Toutes les notifications marquées comme lues.']);
    }

    /**
     * DELETE /notifications/{notification}
     * Delete a single notification.
     */
    public function destroy(Request $request, PushNotification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification supprimée.']);
    }

    /**
     * POST /notifications/device-token
     * Register or update the OneSignal player ID for push notifications.
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
     * Remove the OneSignal player ID (disable push on this device).
     */
    public function removeDeviceToken(Request $request): JsonResponse
    {
        $request->user()->update([
            'onesignal_player_id' => null,
        ]);

        return response()->json(['message' => 'Token appareil supprimé.']);
    }

    /**
     * PATCH /notifications/preferences
     * Toggle notification preferences.
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $request->validate([
            'notifications_enabled' => 'required|boolean',
        ]);

        $request->user()->update([
            'notifications_enabled' => $request->notifications_enabled,
        ]);

        return response()->json([
            'message' => $request->notifications_enabled
                ? 'Notifications activées.'
                : 'Notifications désactivées.',
            'notifications_enabled' => $request->notifications_enabled,
        ]);
    }
}
