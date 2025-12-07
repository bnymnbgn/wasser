"use client";

import { LocalNotifications, PermissionStatus } from "@capacitor/local-notifications";

const REMINDER_BASE_ID = 42000;

async function ensurePermission(): Promise<boolean> {
  try {
    const perm: PermissionStatus = await LocalNotifications.checkPermissions();
    if (perm.display === "granted") return true;
    const req = await LocalNotifications.requestPermissions();
    return req.display === "granted";
  } catch (e) {
    console.warn("[notifications] permission check failed", e);
    return false;
  }
}

export async function cancelHydrationReminders() {
  try {
    const ids = Array.from({ length: 96 }, (_, i) => REMINDER_BASE_ID + i + 1);
    await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) });
  } catch (e) {
    console.warn("[notifications] cancel failed", e);
  }
}

export async function scheduleHydrationReminders(intervalMinutes: number) {
  if (intervalMinutes <= 0) return;
  const granted = await ensurePermission();
  if (!granted) return;
  await cancelHydrationReminders();

  // Plan für die nächsten 8 Stunden
  const horizonMinutes = 8 * 60;
  const count = Math.floor(horizonMinutes / intervalMinutes);
  const now = Date.now();

  const notifications = Array.from({ length: count }, (_, idx) => {
    const at = new Date(now + intervalMinutes * 60000 * (idx + 1));
    return {
      id: REMINDER_BASE_ID + idx + 1,
      title: "Trinken nicht vergessen",
      body: "Kleiner Schluck gefällig? 💧",
      schedule: { at, allowWhileIdle: true },
      sound: undefined,
    };
  });

  try {
    await LocalNotifications.schedule({ notifications });
  } catch (e) {
    console.warn("[notifications] schedule failed", e);
  }
}
