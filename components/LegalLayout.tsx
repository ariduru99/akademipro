import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

export function LegalLayout({
  title,
  subtitle,
  updatedAt,
  children,
}: {
  title: string;
  subtitle?: string;
  updatedAt?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary-600">
            <BookOpen className="w-5 h-5" /> EduCoach
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-primary-600 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Ana sayfaya dön
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-10">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">{title}</h1>
          {subtitle && <p className="text-slate-500 mb-6">{subtitle}</p>}
          {updatedAt && (
            <p className="text-xs text-slate-400 mb-8 uppercase tracking-wider">Son güncelleme: {updatedAt}</p>
          )}
          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-h2:text-xl prose-h2:mt-8 prose-h3:text-lg prose-p:text-slate-600 prose-li:text-slate-600 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline space-y-4 text-sm sm:text-base">
            {children}
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
          <span>·</span>
          <Link href="/iletisim" className="hover:text-primary-600">
            İletişim
          </Link>
        </footer>
      </main>
    </div>
  );
}
