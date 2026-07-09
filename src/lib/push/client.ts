import { api } from "@/lib/api";
import { DEFAULT_REMINDERS, getReminderConfig } from "@/lib/notifications";
import type { ReminderConfig } from "@/types";

export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>;
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushSubscribeResult =
  | { success: true }
  | { success: false; reason: "unsupported" | "denied" | "no_vapid" | "dismissed" | "api_error" };

function getTimezone() {
  return typeof Intl !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "America/Sao_Paulo";
}

export async function subscribeToPush(reminders?: ReminderConfig): Promise<PushSubscribeResult> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { success: false, reason: "unsupported" };
  }

  if (!("Notification" in window)) {
    return { success: false, reason: "unsupported" };
  }

  if (Notification.permission === "denied") {
    return { success: false, reason: "denied" };
  }

  const { data: keyData } = await api.get<{ publicKey: string | null; supported: boolean }>(
    "/push/vapid-key"
  );
  const publicKey = keyData.publicKey;
  if (!publicKey) return { success: false, reason: "no_vapid" };

  let permission: NotificationPermission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission === "denied") return { success: false, reason: "denied" };
  if (permission !== "granted") return { success: false, reason: "dismissed" };

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));

  const config = reminders ?? getReminderConfig();

  const { status } = await api.post("/push/subscribe", {
    subscription: subscription.toJSON(),
    timezone: getTimezone(),
    reminders: config.reminders,
  });

  if (status !== 200) return { success: false, reason: "api_error" };

  return { success: true };
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) await subscription.unsubscribe();

  const { status } = await api.delete("/push/subscribe");
  return status === 200;
}

export async function syncRemindersToServer(userId: string, config: ReminderConfig) {
  await api.patch(`/push/reminders/${userId}`, {
    enabled: config.enabled,
    reminders: config.reminders,
    timezone: getTimezone(),
  });
}

export async function fetchRemindersFromServer(userId: string): Promise<ReminderConfig | null> {
  try {
    const { data } = await api.get<{
      enabled: boolean;
      reminders: ReminderConfig["reminders"];
    }>(`/push/reminders/${userId}`);
    return { enabled: data.enabled, reminders: data.reminders };
  } catch {
    return null;
  }
}

export async function enablePushNotifications(userId: string): Promise<PushSubscribeResult> {
  const config = getReminderConfig();
  const result = await subscribeToPush(config);
  if (result.success) {
    await syncRemindersToServer(userId, { ...config, enabled: true });
  }
  return result;
}

export { DEFAULT_REMINDERS };
