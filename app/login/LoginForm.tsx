"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { isSupabaseClientConfigured } from "@/lib/authEnv";
import { loginWithEmailAndPassword, requestEmailLoginLink } from "@/lib/authAccounts";

export function LoginForm({ roleHint }: { roleHint: string | null }) {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showPass, setShowPass] = useState(false);

  const liveAuth = isSupabaseClientConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      await loginWithEmailAndPassword(identifier, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLink = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const result = await requestEmailLoginLink(identifier);
      setInfo(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş bağlantısı gönderilemedi.");
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
          {!liveAuth && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Canlı giriş altyapısı yapılandırılmamış</p>
                <p className="mt-1">
                  Giriş yapabilmek için Supabase ortam değişkenlerini tanımlayın.
                  Hazır test hesapları artık kullanılmıyor.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
              </div>
            )}
            {info && (
              <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium">
                {info}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                E-posta adresi
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder={roleHint ? `${roleHint} hesabınızın e-postası` : "ornek@email.com"}
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
            <button
              type="button"
              onClick={handleEmailLink}
              disabled={loading || !identifier.trim()}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-60 transition-colors"
            >
              E-posta ile güvenli giriş bağlantısı gönder
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
