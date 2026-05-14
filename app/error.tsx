"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-slate-50 text-slate-800">
      <h1 className="text-xl font-bold">Bir şeyler ters gitti</h1>
      <p className="text-sm text-slate-600 text-center max-w-md">
        {error.message || "Sayfa yüklenirken hata oluştu."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-4 py-2 rounded-full bg-primary-600 text-white font-semibold hover:bg-primary-700"
      >
        Yeniden dene
      </button>
    </div>
  );
}
