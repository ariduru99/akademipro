"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Presentation, Users, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { mockLogin, mockUsers } from "@/lib/mockDb";
import { SESSION_KEY } from "@/lib/profile";
import { isSupabaseClientConfigured } from "@/lib/authEnv";
import { loginWithEmailAndPassword, sessionFromMockUser } from "@/lib/authAccounts";

export function LoginForm({ roleHint }: { roleHint: string | null }) {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!roleHint) return;
    const seedUser = mockUsers.find((u) => u.role === roleHint);
    if (seedUser) setIdentifier((prev) => prev || seedUser.email);
  }, [roleHint]);

  const liveAuth = isSupabaseClientConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = await loginWithEmailAndPassword(identifier, password);
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: "teacher" | "parent" | "student") => {
    const user = mockUsers.find((u) => u.role === role);
    if (!user) return;
    setIdentifier(user.email);
    setPassword(user.password);
    setLoading(true);
    setError("");
    try {
      if (liveAuth) {
        const session = await loginWithEmailAndPassword(user.email, user.password);
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        const loggedIn = await mockLogin(user.email, user.password);
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionFromMockUser(loggedIn)));
      }
      router.push("/dashboard");
    } catch (err) {
      const base = err instanceof Error ? err.message : "Giriş başarısız.";
      setError(
        liveAuth
          ? `${base} Demo hesapları Supabase’te yoksa proje kökünde: npm run seed:demo`
          : base
      );
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-slate-500">Hesabınıza giriş yapın veya yeni bir maceraya başlayın</p>
        </div>

        <div className="card">
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
              Hızlı demo girişi
            </p>
            {liveAuth && (
              <p className="text-[11px] text-slate-500 text-center mb-3 leading-snug">
                Supabase kullanıyorsunuz: demo için önce terminalde{" "}
                <code className="bg-slate-100 px-1 rounded">npm run seed:demo</code> çalıştırın
                (tugba@demo.com, veli@demo.com, şifre password123).
              </p>
            )}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin("teacher")}
                disabled={loading}
                className="flex flex-col items-center justify-center gap-1 py-3 px-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors font-medium text-xs border border-primary-100 disabled:opacity-50"
              >
                <Presentation className="w-5 h-5" /> Öğretmen
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("parent")}
                disabled={loading}
                className="flex flex-col items-center justify-center gap-1 py-3 px-2 bg-secondary-50 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors font-medium text-xs border border-secondary-100 disabled:opacity-50"
              >
                <Users className="w-5 h-5" /> Veli
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("student")}
                disabled={loading}
                className="flex flex-col items-center justify-center gap-1 py-3 px-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium text-xs border border-purple-100 disabled:opacity-50"
              >
                <BookOpen className="w-5 h-5" /> Öğrenci
              </button>
            </div>
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="px-3 text-sm text-slate-400">VEYA</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {liveAuth ? "E-posta adresi" : "E-posta adresi veya profil kodu"}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder={liveAuth ? "ornek@email.com" : "ornek@email.com veya TCH-9024"}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Şifre</label>
                <Link href="/sifremi-unuttum" className="text-xs text-primary-600 hover:underline">
                  Şifremi Unuttum
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  placeholder="••••••••"
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
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Giriş Yap"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Hesabınız yok mu?{" "}
            <Link href="/register" className="text-primary-600 font-semibold hover:underline">
              Ücretsiz Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
