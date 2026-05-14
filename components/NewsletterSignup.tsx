"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Kaydınız başarıyla yapıldı!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Bir hata oluştu.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Sunucuyla bağlantı kurulamadı.");
    }
  };

  return (
    <section className="py-16 bg-primary-600 overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-white md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">Eğitim İpuçlarını Kaçırmayın!</h2>
            <p className="text-primary-100 text-lg">
              Haftalık bültenimize abone olun, en yeni özelliklerden ve eğitim dünyasındaki gelişmelerden ilk siz haberdar olun.
            </p>
          </div>

          <div className="w-full md:w-5/12">
            <div className="bg-white p-2 rounded-2xl shadow-2xl">
              {status === "success" ? (
                <div className="p-6 text-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Harika!</h3>
                  <p className="text-slate-600 mb-4">{message}</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="text-primary-600 font-semibold text-sm hover:underline"
                  >
                    Başka bir kayıt yap
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <div className="relative">
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-posta adresiniz"
                      className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-800"
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="absolute right-2 top-2 bottom-2 bg-primary-600 text-white px-4 rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                      {status === "loading" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {status === "error" && (
                    <p className="flex items-center gap-2 text-red-600 text-xs px-2 animate-in slide-in-from-top-1">
                      <AlertCircle className="w-3 h-3" /> {message}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 px-2 text-center">
                    Abone olarak gizlilik politikamızı ve kullanım koşullarımızı kabul etmiş olursunuz.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
