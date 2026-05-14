"use client";

/**
 * Ortak profil/oturum yardımcıları.
 * - app_settings (Settings sayfasının formu)
 * - teacher_payment_info (Settings IBAN bölümü)
 * - profile_avatar (base64)
 * Kimlik oturumu için tek kaynak Supabase Auth + public.profiles tablosudur.
 */

import { useEffect, useState } from "react";
import { isSupabaseClientConfigured } from "@/lib/authEnv";
import { supabase } from "@/lib/supabase";

export const SETTINGS_KEY = "app_settings";
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

async function readSupabaseSession(): Promise<SessionUser | null> {
  if (!isBrowser() || !isSupabaseClientConfigured() || !supabase) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  if (!user?.id) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, profile_code, city")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;

  const role = profile.role as UserRole;
  if (role !== "teacher" && role !== "student" && role !== "parent") return null;

  return {
    id: profile.id,
    role,
    full_name: profile.full_name || user.email?.split("@")[0] || "Kullanıcı",
    email: user.email || "",
    profile_code: profile.profile_code,
    city: profile.city ?? undefined,
  };
}

/** Kullanıcı oturumunu, ayarlarını ve avatarını dinleyen reaktif hook. */
export function useProfile() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [avatar, setAvatarState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const liveSession = await readSupabaseSession();
      if (cancelled) return;

      const storedSettings = getStoredSettings();
      setSession(liveSession);
      setSettings({
        ...storedSettings,
        fullName: storedSettings.fullName || liveSession?.full_name || "",
        email: storedSettings.email || liveSession?.email || "",
        city: storedSettings.city || liveSession?.city || "",
      });
      setAvatarState(getAvatar());
      setHydrated(true);
    };

    void refresh();
    const onRefresh = () => void refresh();
    window.addEventListener(PROFILE_UPDATED_EVENT, onRefresh);
    window.addEventListener("storage", onRefresh);

    const {
      data: { subscription },
    } = supabase?.auth.onAuthStateChange(() => {
      void refresh();
    }) ?? { data: { subscription: null } };

    return () => {
      cancelled = true;
      window.removeEventListener(PROFILE_UPDATED_EVENT, onRefresh);
      window.removeEventListener("storage", onRefresh);
      subscription?.unsubscribe();
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
  emitProfileChange();
}
