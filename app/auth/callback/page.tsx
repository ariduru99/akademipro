"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { restoreLiveSession } from "@/lib/authAccounts";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const completeLogin = async () => {
      if (!supabase) {
        setError("Supabase kimlik altyapısı yapılandırılmamış.");
        return;
      }

      try {
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        const session = await restoreLiveSession();
        if (!session) {
          throw new Error("Oturum doğrulanamadı. Giriş bağlantısı süresi dolmuş olabilir.");
        }

        if (!cancelled) router.replace("/dashboard");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Giriş tamamlanamadı.");
        }
      }
    };

    void completeLogin();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-slate-100 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h1 className="text-lg font-bold text-slate-800">Giriş tamamlanamadı</h1>
          <p className="text-sm text-slate-600">{error}</p>
          <Link href="/login" className="btn btn-primary inline-flex">
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-500 gap-3">
      <Loader2 className="w-7 h-7 animate-spin" />
      Oturum doğrulanıyor...
    </div>
  );
}
