import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_REMINDERS,
  getReminderConfig,
  saveReminderConfig,
} from "@/lib/notifications";
import {
  enablePushNotifications,
  fetchRemindersFromServer,
  syncRemindersToServer,
  unsubscribeFromPush,
} from "@/lib/push/client";
import type { ReminderConfig } from "@/types";

const PUSH_ERROR_MESSAGES: Record<string, string> = {
  denied: "Permissão de notificação negada",
  unsupported: "Seu navegador não suporta notificações push",
  no_vapid: "Push não configurado no servidor",
  dismissed: "Permissão não concedida",
  api_error: "Erro ao ativar notificações",
};

export function useReminders(userId?: string) {
  const [reminders, setReminders] = useState<ReminderConfig>(DEFAULT_REMINDERS);
  const [loading, setLoading] = useState(true);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!userId) {
        setLoading(false);
        return;
      }

      const fromServer = await fetchRemindersFromServer(userId);
      if (fromServer) {
        setReminders(fromServer);
        saveReminderConfig(fromServer);
      } else {
        const local = getReminderConfig();
        setReminders({ ...local, enabled: false });
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  const toggleReminders = useCallback(
    async (onError?: (msg: string) => void, onSuccess?: (msg: string) => void) => {
      if (!userId) return;
      setPushLoading(true);

      try {
        if (!reminders.enabled) {
          const result = await enablePushNotifications(userId);
          if (!result.success) {
            onError?.(PUSH_ERROR_MESSAGES[result.reason] ?? "Erro ao ativar");
            return;
          }
          const updated = { ...reminders, enabled: true };
          setReminders(updated);
          saveReminderConfig(updated);
          onSuccess?.("Lembretes ativados! Você receberá nos horários configurados.");
        } else {
          await unsubscribeFromPush();
          const updated = { ...reminders, enabled: false };
          setReminders(updated);
          saveReminderConfig(updated);
          await syncRemindersToServer(userId, updated);
          onSuccess?.("Lembretes desativados");
        }
      } finally {
        setPushLoading(false);
      }
    },
    [userId, reminders]
  );

  const updateReminderTime = useCallback(
    async (id: string, time: string) => {
      const updated = {
        ...reminders,
        reminders: reminders.reminders.map((r) => (r.id === id ? { ...r, time } : r)),
      };
      setReminders(updated);
      saveReminderConfig(updated);
      if (userId && reminders.enabled) {
        await syncRemindersToServer(userId, updated);
      }
    },
    [userId, reminders]
  );

  return { reminders, loading, pushLoading, toggleReminders, updateReminderTime, setReminders };
}
