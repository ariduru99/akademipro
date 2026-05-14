"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "cookie_consent_v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (!v) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = (mode: "accept" | "reject") => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode, at: new Date().toISOString() })
      );
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:bottom-6 sm:right-auto sm:max-w-md z-[100] animate-in slide-in-from-bottom-8">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800">Çerezler</p>
            <p className="text-xs text-slate-600 mt-1">
              Akademi Pro yalnızca oturum yönetimi ve tercihlerinizi hatırlamak için zorunlu çerezler kullanır.
              Reklam veya üçüncü taraf takip çerezi kullanmıyoruz. Detaylar için{" "}
              <Link href="/gizlilik" className="text-primary-600 underline">
                Gizlilik Politikası
              </Link>
              .
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                type="button"
                onClick={() => accept("accept")}
                className="px-3 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700"
              >
                Kabul ediyorum
              </button>
              <button
                type="button"
                onClick={() => accept("reject")}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
              >
                Sadece zorunlu
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => accept("reject")}
            className="p-1 text-slate-400 hover:text-slate-700"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
