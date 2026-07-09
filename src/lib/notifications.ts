import type { ReminderConfig } from "@/types";
import { GLUCOSE_PERIODS } from "./utils";

const STORAGE_KEY = "glicose-reminders";

export const DEFAULT_REMINDERS: ReminderConfig = {
  enabled: true,
  reminders: [
    { id: "1", period: "Jejum", time: "07:00", label: "Medir glicemia em jejum" },
    { id: "2", period: "Após Café", time: "09:30", label: "Medir glicemia após o café" },
    { id: "3", period: "Após Almoço", time: "14:00", label: "Medir glicemia após o almoço" },
    { id: "4", period: "Após Jantar", time: "20:30", label: "Medir glicemia após o jantar" },
  ],
};

export function getReminderConfig(): ReminderConfig {
  if (typeof window === "undefined") return DEFAULT_REMINDERS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_REMINDERS;
  try {
    return JSON.parse(stored) as ReminderConfig;
  } catch {
    return DEFAULT_REMINDERS;
  }
}

export function saveReminderConfig(config: ReminderConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function showNotification(title: string, body: string, tag?: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        tag,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        data: { url: "/medicao" },
      } as NotificationOptions);
    });
    return;
  }

  new Notification(title, {
    body,
    tag,
    icon: "/icons/icon-192.png",
  });
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

let checkInterval: ReturnType<typeof setInterval> | null = null;
const firedToday = new Set<string>();

export function startReminderScheduler() {
  if (typeof window === "undefined") return;
  if (checkInterval) return;

  const check = () => {
    const config = getReminderConfig();
    if (!config.enabled) return;

    const today = new Date().toDateString();
    const current = getCurrentMinutes();

    config.reminders.forEach((reminder) => {
      const key = `${today}-${reminder.id}`;
      const target = timeToMinutes(reminder.time);
      if (current === target && !firedToday.has(key)) {
        firedToday.add(key);
        const periodInfo = GLUCOSE_PERIODS.find((p) => p.value === reminder.period);
        showNotification(
          "Hora de medir a glicemia 💗",
          `${periodInfo?.icon ?? ""} ${reminder.label}`,
          key
        );
      }
    });

    if (getCurrentMinutes() < 1) {
      firedToday.clear();
    }
  };

  checkInterval = setInterval(check, 30_000);
  check();
}

export function stopReminderScheduler() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}
