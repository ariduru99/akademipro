"use client";

/**
 * Bildirim alt sistemi.
 * - Uygulama içi bildirim listesi (localStorage + custom event)
 * - Tarayıcı (Web Notification API) bildirimleri
 * - E-posta için API endpoint'ine yönlendirme
 *
 * Tüm fonksiyonlar tarayıcıda (client component) çağrılmak üzere tasarlandı;
 * SSR sırasında window/localStorage kontrolleri ile sessizce no-op yaparlar.
 */

export type NotificationKind =
  | "info"
  | "lesson"
  | "payment"
  | "message"
  | "system";

export type NotificationChannel = "app" | "email" | "sms";

export type NotificationSettings = {
  notifEmail: boolean;
  notifSms: boolean;
  notifApp: boolean;
  /** Ders öncesi kaç dakika hatırlatma */
  reminderMinutes: number;
  /** "HH:MM" — sessiz mod başlangıç (boşsa kapalı) */
  quietStart: string;
  /** "HH:MM" — sessiz mod bitiş */
  quietEnd: string;
  /** Bildirim kanal kontaktları (e-posta ayarlardaki kişisel bilgiden gelir) */
  email?: string;
  phone?: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  kind: NotificationKind;
  href?: string;
  createdAt: string;
  readAt?: string;
};

const APP_NOTIF_KEY = "app_notifications";
const SETTINGS_KEY = "app_settings";
export const NOTIFICATIONS_UPDATED_EVENT = "notifications:updated";

const DEFAULT_SETTINGS: NotificationSettings = {
  notifEmail: true,
  notifSms: false,
  notifApp: true,
  reminderMinutes: 15,
  quietStart: "",
  quietEnd: "",
};

function isBrowser() {
  return typeof window !== "undefined";
}

function safeUUID(): string {
  if (isBrowser() && "crypto" in window && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function emitChange() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
}

export function getNotificationSettings(): NotificationSettings {
  if (!isBrowser()) return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<NotificationSettings> & {
      email?: string;
      phone?: string;
    };
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      notifSms: false,
      email: parsed.email,
      phone: parsed.phone,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function getStoredAppNotifications(): AppNotification[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(APP_NOTIF_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as AppNotification[];
  } catch {
    return [];
  }
}

function persistAppNotifications(list: AppNotification[]): void {
  if (!isBrowser()) return;
  const trimmed = list.slice(-100);
  localStorage.setItem(APP_NOTIF_KEY, JSON.stringify(trimmed));
  emitChange();
}

export function addAppNotification(input: {
  title: string;
  body: string;
  kind?: NotificationKind;
  href?: string;
}): AppNotification {
  const n: AppNotification = {
    id: safeUUID(),
    title: input.title,
    body: input.body,
    kind: input.kind ?? "info",
    href: input.href,
    createdAt: new Date().toISOString(),
  };
  const list = getStoredAppNotifications();
  list.push(n);
  persistAppNotifications(list);
  return n;
}

export function markNotificationRead(id: string): void {
  const list = getStoredAppNotifications().map((n) =>
    n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n
  );
  persistAppNotifications(list);
}

export function markAllNotificationsRead(): void {
  const now = new Date().toISOString();
  const list = getStoredAppNotifications().map((n) =>
    n.readAt ? n : { ...n, readAt: now }
  );
  persistAppNotifications(list);
}

export function clearAllNotifications(): void {
  persistAppNotifications([]);
}

export function unreadCount(): number {
  return getStoredAppNotifications().filter((n) => !n.readAt).length;
}

/* -------------------- Tarayıcı (Web Notification API) -------------------- */

export type BrowserPermission = "default" | "granted" | "denied" | "unsupported";

export function getBrowserPermission(): BrowserPermission {
  if (!isBrowser() || typeof Notification === "undefined") return "unsupported";
  return Notification.permission as BrowserPermission;
}

export async function requestBrowserNotificationPermission(): Promise<BrowserPermission> {
  if (!isBrowser() || typeof Notification === "undefined") return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    const result = await Notification.requestPermission();
    return result as BrowserPermission;
  } catch {
    return "denied";
  }
}

function isInQuietHours(s: NotificationSettings, now = new Date()): boolean {
  if (!s.quietStart || !s.quietEnd) return false;
  const [sh, sm] = s.quietStart.split(":").map((x) => parseInt(x, 10) || 0);
  const [eh, em] = s.quietEnd.split(":").map((x) => parseInt(x, 10) || 0);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const startM = sh * 60 + sm;
  const endM = eh * 60 + em;
  if (startM === endM) return false;
  if (startM < endM) return minutes >= startM && minutes < endM;
  return minutes >= startM || minutes < endM;
}

function maybeShowBrowserNotification(title: string, body: string): void {
  if (!isBrowser() || typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag: "educoach",
    });
  } catch {
    // sessizce yoksay
  }
}

/* -------------------- E-posta API çağrısı -------------------- */

export type ChannelDispatchResult = {
  channel: NotificationChannel;
  ok: boolean;
  status: "sent" | "queued" | "skipped" | "error";
  message?: string;
};

async function postJSON<T>(url: string, payload: unknown): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => null)) as T | null;
    if (!res.ok) return null;
    return data;
  } catch {
    return null;
  }
}

export type SendNotificationInput = {
  title: string;
  body: string;
  kind?: NotificationKind;
  href?: string;
  /** İstenirse belirli kanallara zorla; aksi halde ayarlardan açık olanlar */
  channels?: NotificationChannel[];
  /** Sessiz saatleri yoksay (kritik uyarılar için) */
  bypassQuietHours?: boolean;
};

export async function sendNotification(
  input: SendNotificationInput
): Promise<ChannelDispatchResult[]> {
  const settings = getNotificationSettings();
  const wanted = (input.channels ?? ([
    settings.notifApp ? "app" : null,
    settings.notifEmail ? "email" : null,
  ].filter(Boolean) as NotificationChannel[])).filter((ch) => ch !== "sms");

  const results: ChannelDispatchResult[] = [];
  const quiet = !input.bypassQuietHours && isInQuietHours(settings);

  for (const ch of wanted) {
    if (ch === "app") {
      addAppNotification({
        title: input.title,
        body: input.body,
        kind: input.kind,
        href: input.href,
      });
      if (!quiet) maybeShowBrowserNotification(input.title, input.body);
      results.push({
        channel: "app",
        ok: true,
        status: "sent",
        message: quiet ? "Sessiz saat: yalnızca liste" : "Uygulama içi gösterildi",
      });
      continue;
    }

    if (ch === "email") {
      if (!settings.email) {
        results.push({
          channel: "email",
          ok: false,
          status: "skipped",
          message: "E-posta adresi tanımsız",
        });
        continue;
      }
      const data = await postJSON<{ status: ChannelDispatchResult["status"]; provider?: string; message?: string }>(
        "/api/notify/email",
        {
          to: settings.email,
          title: input.title,
          body: input.body,
          kind: input.kind,
        }
      );
      results.push({
        channel: "email",
        ok: !!data,
        status: data?.status ?? "error",
        message: data?.message ?? (data ? `Sağlayıcı: ${data.provider ?? "-"}` : "Gönderim başarısız"),
      });
      continue;
    }

    if (ch === "sms") {
      if (!settings.phone) {
        results.push({
          channel: "sms",
          ok: false,
          status: "skipped",
          message: "Telefon numarası tanımsız",
        });
        continue;
      }
      const data = await postJSON<{ status: ChannelDispatchResult["status"]; provider?: string; message?: string }>(
        "/api/notify/sms",
        {
          to: settings.phone,
          title: input.title,
          body: input.body,
          kind: input.kind,
        }
      );
      results.push({
        channel: "sms",
        ok: !!data,
        status: data?.status ?? "error",
        message: data?.message ?? (data ? `Sağlayıcı: ${data.provider ?? "-"}` : "Gönderim başarısız"),
      });
    }
  }

  return results;
}

/* -------------------- Outbox (sağlayıcı yapılandırılmadığında simülasyon) -------------------- */

export type OutboxEntry = {
  id: string;
  channel: "email" | "sms";
  to: string;
  title: string;
  body: string;
  status: "queued" | "sent" | "error";
  provider: string;
  createdAt: string;
};

export type ProvidersStatus = {
  email: { configured: boolean; provider: string };
  sms: { configured: boolean; provider: string };
};

export async function fetchOutbox(): Promise<{
  entries: OutboxEntry[];
  providers: ProvidersStatus;
} | null> {
  try {
    const res = await fetch("/api/notify/outbox", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as {
      entries: OutboxEntry[];
      providers: ProvidersStatus;
    };
  } catch {
    return null;
  }
}
