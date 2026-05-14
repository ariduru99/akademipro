"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, RefreshCw, Send } from "lucide-react";

type CommentItem = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

const POLL_MS = 8000;

export function HomeComments() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const mounted = useRef(true);

  const load = useCallback(async (opts?: { soft?: boolean }) => {
    const soft = opts?.soft;
    if (soft) setFetching(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", { cache: "no-store" });
      if (!res.ok) throw new Error("Yorumlar yüklenemedi.");
      const data = (await res.json()) as CommentItem[];
      if (mounted.current) setComments(Array.isArray(data) ? data : []);
    } catch {
      if (mounted.current) setError("Yorumlar şu an alınamadı. Biraz sonra tekrar deneyin.");
    } finally {
      if (mounted.current) {
        setLoading(false);
        setFetching(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void load();
    const id = window.setInterval(() => load({ soft: true }), POLL_MS);
    return () => {
      mounted.current = false;
      window.clearInterval(id);
    };
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, text }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Gönderilemedi.");
        return;
      }
      setText("");
      await load({ soft: true });
    } catch {
      setError("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="yorumlar"
      className="max-w-7xl mx-auto px-8 py-16 border-t border-slate-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
            Ziyaretçi yorumları
          </h2>
          <p className="text-slate-500 max-w-xl">
            Düşüncelerinizi paylaşın; liste birkaç saniyede bir otomatik yenilenir.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 ${
              fetching ? "text-primary-600" : ""
            }`}
          >
            <RefreshCw
              className={`w-4 h-4 ${fetching ? "animate-spin" : "opacity-40"}`}
              aria-hidden
            />
            Canlı yenileme (~{POLL_MS / 1000}s)
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
        >
          <div>
            <label htmlFor="visitor-name" className="block text-sm font-semibold text-slate-700 mb-1">
              Adınız
            </label>
            <input
              id="visitor-name"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="örn. Ayşe"
              maxLength={80}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
              required
            />
          </div>
          <div>
            <label htmlFor="visitor-comment" className="block text-sm font-semibold text-slate-700 mb-1">
              Yorumunuz
            </label>
            <textarea
              id="visitor-comment"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Platform hakkındaki görüşlerinizi yazın..."
              maxLength={1000}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow resize-y min-h-[120px]"
              required
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{text.length}/1000</p>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full sm:w-auto rounded-xl disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Gönderiliyor..." : "Yorumu gönder"}
          </button>
        </form>

        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6 min-h-[280px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <RefreshCw className="w-8 h-8 animate-spin" aria-hidden />
              <span>Yorumlar yükleniyor...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2 text-center">
              <MessageCircle className="w-10 h-10 opacity-40" aria-hidden />
              <p>Henüz yorum yok. İlk siz yazın.</p>
            </div>
          ) : (
            <ul className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
                >
                  <div className="flex justify-between gap-2 items-start mb-2">
                    <span className="font-bold text-slate-800">{c.author}</span>
                    <time
                      className="text-xs text-slate-400 shrink-0"
                      dateTime={c.createdAt}
                    >
                      {new Date(c.createdAt).toLocaleString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed break-words">
                    {c.text}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
