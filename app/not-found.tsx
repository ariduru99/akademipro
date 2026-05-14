import Link from "next/link";
import { BookOpen, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-slate-100 flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-lg max-w-lg w-full p-10 text-center space-y-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-2xl font-bold text-primary-600"
        >
          <BookOpen className="w-7 h-7" />
          Akademi Pro
        </Link>
        <p className="text-7xl font-black text-primary-600/80 tracking-tight">404</p>
        <h1 className="text-2xl font-bold text-slate-800">Aradığınız sayfa bulunamadı</h1>
        <p className="text-slate-500 text-sm">
          Adres yanlış girilmiş, sayfa kaldırılmış ya da hiç var olmamış olabilir. Aşağıdaki bağlantılardan
          devam edebilirsiniz.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            <Home className="w-4 h-4" /> Ana Sayfa
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Panele dön
          </Link>
        </div>
      </div>
    </div>
  );
}
