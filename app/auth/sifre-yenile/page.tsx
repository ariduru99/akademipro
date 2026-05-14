"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { isSupabaseClientConfigured } from "@/lib/authEnv";
import { supabase } from "@/lib/supabase";
import { logoutClient } from "@/lib/authAccounts";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseClientConfigured() || !supabase) {
      setChecking(false);
      return;
    }

    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && session) setReady(true);
      if (!cancelled) setChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pass.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (pass !== pass2) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (!supabase) return;
    setLoading(true);
    try {
      const { error: updErr } = await supabase.auth.updateUser({ password: pass });
      if (updErr) throw new Error(updErr.message || "Şifre güncellenemedi.");
      await logoutClient();
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseClientConfigured() || !supabase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-slate-100 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center space-y-4">
          <p className="text-slate-600 text-sm">
            Şifre sıfırlama yalnızca Supabase yapılandırıldığında kullanılabilir. Şu an demo modundasınız;
            şifre sıfırlama için &quot;Şifremi unuttum&quot; sayfasındaki demo akışını kullanın.
          </p>
          <Link href="/login" className="btn btn-primary inline-block">
            Girişe dön
          </Link>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-slate-100 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h1 className="text-lg font-bold text-slate-800">Bağlantı geçersiz veya süresi dolmuş</h1>
          <p className="text-sm text-slate-600">
            E-postadaki sıfırlama bağlantısını yeniden isteyin veya giriş yapın.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/sifremi-unuttum" className="text-primary-600 font-semibold text-sm hover:underline">
              Yeni sıfırlama bağlantısı iste
            </Link>
            <Link href="/login" className="text-slate-500 text-sm hover:underline">
              Giriş sayfası
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-primary-600 mb-2 hover:scale-105 transition-transform"
          >
            <BookOpen className="w-8 h-8" />
            Akademi Pro
          </Link>
          <p className="text-slate-500 text-sm">Yeni şifrenizi belirleyin</p>
        </div>

        <div className="card space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Yeni şifre</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="En az 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  aria-label={showPass ? "Gizle" : "Göster"}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Yeni şifre (tekrar)</label>
              <input
                type={showPass ? "text" : "password"}
                value={pass2}
                onChange={(e) => setPass2(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-70">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Şifreyi kaydet"}
            </button>
          </form>
          <Link href="/login" className="block text-center text-sm text-slate-500 hover:text-primary-600">
            Girişe dön
          </Link>
        </div>
      </div>
    </div>
  );
}
