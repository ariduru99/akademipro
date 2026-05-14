"use client";

/**
 * Ortak profil/oturum yardımcıları.
 * - app_settings (Settings sayfasının formu)
 * - auth_session (Login sayfası)
 * - teacher_payment_info (Settings IBAN bölümü)
 * - profile_avatar (base64)
 * Birden fazla sayfada tutarlı veri için tek kaynak.
 */

import { useEffect, useState } from "react";

export const SETTINGS_KEY = "app_settings";
export const SESSION_KEY = "auth_session";
export const PAYMENT_INFO_KEY = "teacher_payment_info";
export const AVATAR_KEY = "profile_avatar";
export const PROFILE_UPDATED_EVENT = "profile:updated";

export type UserRole = "teacher" | "student" | "parent";

export type AppSettings = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  currentPassword: string;
  newPassword: string;
  notifEmail: boolean;
  notifSms: boolean;
  notifApp: boolean;
  reminderMinutes: number;
  quietStart: string;
  quietEnd: string;
  iban: string;
  bankName: string;
  accountHolder: string;
  tcKimlik: string;
  vergiDairesi: string;
  vergiNo: string;
  isFreelancer: boolean;
};

export type SessionUser = {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  profile_code?: string;
  city?: string;
};

export type PaymentInfo = {
  iban: string;
  bankName: string;
  accountHolder: string;
};

export const DEFAULT_SETTINGS: AppSettings = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  currentPassword: "",
  newPassword: "",
  notifEmail: true,
  notifSms: false,
  notifApp: true,
  reminderMinutes: 15,
  quietStart: "",
  quietEnd: "",
  iban: "",
  bankName: "",
  accountHolder: "",
  tcKimlik: "",
  vergiDairesi: "",
  vergiNo: "",
  isFreelancer: true,
};

const isBrowser = () => typeof window !== "undefined";

export function getSession(): SessionUser | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<SessionUser>;
    if (!p?.id || !p?.role) return null;
    return {
      id: p.id,
      role: p.role,
      full_name: p.full_name || "",
      email: p.email || "",
      profile_code: p.profile_code,
      city: p.city,
    };
  } catch {
    return null;
  }
}

export function getStoredSettings(): AppSettings {
  if (!isBrowser()) return { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed, notifSms: false };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function persistSettings(next: AppSettings): void {
  if (!isBrowser()) return;
  const safe: AppSettings = { ...next, notifSms: false };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(safe));
  localStorage.setItem(
    PAYMENT_INFO_KEY,
    JSON.stringify({
      iban: safe.iban,
      bankName: safe.bankName,
      accountHolder: safe.accountHolder || safe.fullName,
    } satisfies PaymentInfo)
  );
  const session = getSession();
  if (session) {
    const updated: SessionUser = {
      ...session,
      full_name: safe.fullName || session.full_name,
      email: safe.email || session.email,
      city: safe.city || session.city,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  }
  emitProfileChange();
}

export function getPaymentInfo(): PaymentInfo {
  if (!isBrowser()) return { iban: "", bankName: "", accountHolder: "" };
  try {
    const raw = localStorage.getItem(PAYMENT_INFO_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<PaymentInfo>;
      return {
        iban: p.iban || "",
        bankName: p.bankName || "",
        accountHolder: p.accountHolder || "",
      };
    }
  } catch {
    /* ignore */
  }
  const s = getStoredSettings();
  return {
    iban: s.iban,
    bankName: s.bankName,
    accountHolder: s.accountHolder || s.fullName,
  };
}

export function getAvatar(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(AVATAR_KEY);
}

export function setAvatar(dataUrl: string | null): void {
  if (!isBrowser()) return;
  if (!dataUrl) localStorage.removeItem(AVATAR_KEY);
  else localStorage.setItem(AVATAR_KEY, dataUrl);
  emitProfileChange();
}

export function emitProfileChange(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT));
}

/** Kullanıcı oturumunu, ayarlarını ve avatarını dinleyen reaktif hook. */
export function useProfile() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [avatar, setAvatarState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setSession(getSession());
      setSettings(getStoredSettings());
      setAvatarState(getAvatar());
    };
    refresh();
    setHydrated(true);
    window.addEventListener(PROFILE_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const role: UserRole = session?.role || "teacher";
  const fullName = settings.fullName || session?.full_name || "";
  const initials = (fullName || "?")
    .split(" ")
    .map((p) => p.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return {
    hydrated,
    session,
    settings,
    avatar,
    role,
    fullName,
    initials,
    firstName: fullName.split(" ")[0] || "",
  };
}

export function clearSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(SESSION_KEY);
  emitProfileChange();
}
