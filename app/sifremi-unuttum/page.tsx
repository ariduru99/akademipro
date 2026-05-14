"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { requestPasswordReset } from "@/lib/authAccounts";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);
    try {
      const result = await requestPasswordReset(identifier);
      setSuccess(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
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
          <p className="text-slate-500">Şifrenizi mi unuttunuz? Sıfırlama bağlantısı gönderelim.</p>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Talep Alındı</h3>
              <p className="text-sm text-slate-600">{success}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:underline text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
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
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="adiniz@alanadiniz.com"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Sıfırlama bağlantısını e-posta adresinize göndereceğiz.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sıfırlama Bağlantısı Gönder"}
              </button>
              <Link
                href="/login"
                className="block text-center text-sm text-slate-500 hover:text-primary-600 mt-2"
              >
                Vazgeç ve giriş yap
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
