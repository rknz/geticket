export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  iconUrl?: string;
}

export interface NotificationDeliveryResult {
  deliveredVia: "browser_notification" | "in_app_fallback";
  reason?: string;
}

export interface BrowserNotificationApi {
  create(
    notificationId: string,
    options: {
      type: "basic";
      iconUrl: string;
      title: string;
      message: string;
    },
  ): Promise<string> | void;
}

/**
 * Safely attempts to show a native WebExtension notification and falls back to
 * an in-app alert record when notifications are unavailable or blocked (e.g. Kiwi Android).
 */
export async function dispatchSafeNotification(
  payload: NotificationPayload,
  api?: BrowserNotificationApi | null,
): Promise<NotificationDeliveryResult> {
  if (!api || typeof api.create !== "function") {
    return {
      deliveredVia: "in_app_fallback",
      reason: "Notifications API is not supported in this browser; recorded as in-app alert.",
    };
  }

  try {
    await api.create(payload.id, {
      type: "basic",
      iconUrl: payload.iconUrl ?? "assets/icons/icon-128.png",
      title: payload.title,
      message: payload.message,
    });
    return { deliveredVia: "browser_notification" };
  } catch (err) {
    return {
      deliveredVia: "in_app_fallback",
      reason:
        err instanceof Error
          ? `Browser notification unavailable (${err.message}); recorded as in-app alert.`
          : "Browser notification unavailable; recorded as in-app alert.",
    };
  }
}
