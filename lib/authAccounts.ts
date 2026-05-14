import { mockLogin, mockRegister, mockResetPassword, type MockUser } from "@/lib/mockDb";
import type { SessionUser, UserRole } from "@/lib/profile";
import { clearSession } from "@/lib/profile";
import { isSupabaseClientConfigured } from "@/lib/authEnv";
import { supabase } from "@/lib/supabase";

export function sessionFromMockUser(user: MockUser): SessionUser {
  return {
    id: user.id,
    role: user.role,
    full_name: user.full_name,
    email: user.email,
    profile_code: user.profile_code,
    city: user.city,
  };
}

function mapSupabaseLoginMessage(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials"))
    return "Hatalı e-posta veya şifre.";
  if (m.includes("email not confirmed"))
    return "E-posta henüz doğrulanmadı. Gelen kutunuzu kontrol edin.";
  return msg || "Giriş başarısız.";
}

function mapPasswordResetMessage(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("rate limit")) return "Çok fazla istek. Bir süre sonra tekrar deneyin.";
  return msg || "İşlem başarısız.";
}

/**
 * Mock: profil kodu veya e-posta. Supabase: yalnızca e-posta; redirect için tarayıcı origin kullanılır.
 * Supabase panelinde Authentication → URL Configuration içine `.../auth/sifre-yenile` ekleyin.
 */
export async function requestPasswordReset(identifier: string): Promise<{ message: string }> {
  const id = identifier.trim();
  if (!id) throw new Error("Bu alan zorunlu.");

  if (isSupabaseClientConfigured()) {
    if (!supabase) throw new Error("Supabase istemcisi oluşturulamadı.");
    if (!id.includes("@")) {
      throw new Error("Canlı ortamda sıfırlama için e-posta adresinizi girin (profil kodu kullanılmaz).");
    }
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
    if (!origin) {
      throw new Error(
        "Oturum adresi bulunamadı. Tarayıcıda açın veya NEXT_PUBLIC_SITE_URL tanımlayın."
      );
    }
    const redirectTo = `${origin}/auth/sifre-yenile`;
    const { error } = await supabase.auth.resetPasswordForEmail(id, { redirectTo });
    if (error) throw new Error(mapPasswordResetMessage(error.message));
    return {
      message:
        "E-postanıza sıfırlama bağlantısı gönderildi. Gelen kutunuzu ve spam klasörünü kontrol edin; bağlantının süresi dolabilir.",
    };
  }

  return mockResetPassword(id);
}

export async function loginWithEmailAndPassword(
  identifier: string,
  password: string
): Promise<SessionUser> {
  const id = identifier.trim();
  if (!id || !password) throw new Error("E-posta ve şifre zorunlu.");

  if (isSupabaseClientConfigured()) {
    if (!supabase) {
      throw new Error("Supabase istemcisi oluşturulamadı. Ortam değişkenlerini kontrol edin.");
    }
    if (!id.includes("@")) {
      throw new Error(
        "Canlı ortamda giriş için e-posta adresinizi kullanın (profil kodu yerine)."
      );
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: id,
      password,
    });
    if (error) throw new Error(mapSupabaseLoginMessage(error.message));

    const uid = data.user?.id;
    if (!uid) throw new Error("Oturum oluşturulamadı.");

    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("id, role, full_name, profile_code, city")
      .eq("id", uid)
      .single();

    if (pErr || !profile) {
      const detail = pErr?.message ? ` (${pErr.message})` : "";
      throw new Error(
        `Profil kaydı bulunamadı${detail}. SQL migration (handle_new_user tetikleyicisi) uygulandı mı kontrol edin veya hesabı yeniden oluşturun.`
      );
    }

    const role = profile.role as UserRole;
    if (role !== "teacher" && role !== "student" && role !== "parent") {
      throw new Error("Bu hesap rolü panele giriş için desteklenmiyor.");
    }

    return {
      id: profile.id,
      role,
      full_name: profile.full_name,
      email: data.user.email ?? id,
      profile_code: profile.profile_code,
      city: profile.city ?? undefined,
    };
  }

  const user = await mockLogin(id, password);
  return sessionFromMockUser(user);
}

export async function registerTeacherLive(input: {
  fullName: string;
  email: string;
  password: string;
  city?: string;
}): Promise<void> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "teacher",
      fullName: input.fullName,
      email: input.email.trim(),
      password: input.password,
      city: input.city,
    }),
  });
  const json = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(json.error || "Kayıt başarısız.");
}

export async function registerStudentParentLive(input: {
  student: { fullName: string; email: string; password: string };
  parent: { fullName: string; email: string; password: string };
  city?: string;
}): Promise<void> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "student_parent",
      student: {
        fullName: input.student.fullName,
        email: input.student.email.trim(),
        password: input.student.password,
      },
      parent: {
        fullName: input.parent.fullName,
        email: input.parent.email.trim(),
        password: input.parent.password,
      },
      city: input.city,
    }),
  });
  const json = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(json.error || "Kayıt başarısız.");
}

/** Oturumu temizler; Supabase oturumu varsa çıkış yapar. */
export async function logoutClient(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (isSupabaseClientConfigured() && supabase) {
      await supabase.auth.signOut();
    }
  } catch {
    /* ignore */
  }
  clearSession();
}
