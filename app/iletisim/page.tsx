"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Genel bilgi");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: `${name.trim()} (iletişim)`,
          text: `Konu: ${subject}\nE-posta: ${email}\n\n${message}`,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Mesaj iletilemedi.");
      }
      setDone(true);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mesaj iletilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary-600">
            <BookOpen className="w-5 h-5" /> Akademi Pro
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-primary-600 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Ana sayfaya dön
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-10">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">İletişim</h1>
          <p className="text-slate-500 mb-8">
            Sorunuz, geri bildiriminiz veya işbirliği talebiniz varsa formu doldurun ya da iletişim
            bilgilerimizi kullanın.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-posta</p>
                  <a href="mailto:destek@akademipro.tr" className="text-slate-800 font-medium hover:text-primary-600">
                    destek@akademipro.tr
                  </a>
                  <p className="text-xs text-slate-500 mt-1">Genel sorular için 1 iş günü içinde yanıtlanır.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Adres</p>
                  <p className="text-slate-800 font-medium">İstanbul, Türkiye</p>
                  <p className="text-xs text-slate-500 mt-1">Tam tebligat adresi talep üzerine paylaşılır.</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600">
                <strong className="text-slate-800">KVKK talepleriniz</strong> için lütfen e-postanın konusuna
                &quot;KVKK&quot; yazın. Talebinize en geç 30 gün içinde yanıt veriyoruz.
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {done && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg p-3 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  Mesajınız alındı. En kısa sürede size dönüş yapacağız.
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adınız Soyadınız</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Konu</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white"
                >
                  <option>Genel bilgi</option>
                  <option>Teknik destek</option>
                  <option>Hesap & şifre</option>
                  <option>Ödeme & fatura</option>
                  <option>İşbirliği</option>
                  <option>KVKK</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mesajınız</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  maxLength={1500}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-y"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">{message.length}/1500</p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full sm:w-auto rounded-xl disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? "Gönderiliyor..." : "Mesajı Gönder"}
              </button>
            </form>
          </div>
        </div>

        <footer className="text-center text-xs text-slate-400 mt-8 space-x-3">
          <Link href="/gizlilik" className="hover:text-primary-600">
            Gizlilik
          </Link>
          <span>·</span>
          <Link href="/kullanim-kosullari" className="hover:text-primary-600">
            Kullanım Koşulları
          </Link>
        </footer>
      </main>
    </div>
  );
}
