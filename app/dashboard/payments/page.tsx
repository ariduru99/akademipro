"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Trash2,
  X,
  CheckCircle2,
  Send,
  Copy,
  Clock,
  Check,
  ArrowUpRight,
  Building2,
} from "lucide-react";
import { getPaymentInfo, useProfile, PROFILE_UPDATED_EVENT, type PaymentInfo } from "@/lib/profile";
import { readUserState, writeUserState } from "@/lib/appState";

type PaymentStatus = "pending" | "paid" | "confirmed";

type PaymentRequest = {
  id: number;
  student: string;
  parent: string;
  desc: string;
  amount: number;
  date: string;
  status: PaymentStatus;
};

const STORAGE_KEY = "payment_requests";
const STUDENTS_STORAGE_KEY = "students_data";

type StudentOption = {
  name: string;
  parent: string;
};

const initialRequests: PaymentRequest[] = [];

export default function PaymentsPage() {
  const { role: userRole, fullName } = useProfile();
  const [requests, setRequests] = useState<PaymentRequest[]>(initialRequests);
  const [hydrated, setHydrated] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({ iban: "", bankName: "", accountHolder: "" });
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);

  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [newReq, setNewReq] = useState({ student: "", desc: "", amount: "" });
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      readUserState<PaymentRequest[]>(STORAGE_KEY, initialRequests),
      readUserState<Array<{ name?: string; parent?: string }>>(STUDENTS_STORAGE_KEY, []),
    ])
      .then(([saved, parsed]) => {
        if (cancelled) return;
        if (Array.isArray(saved)) setRequests(saved);
        if (Array.isArray(parsed)) {
          setStudentOptions(
            parsed
              .filter((s) => s.name)
              .map((s) => ({ name: String(s.name), parent: s.parent ? String(s.parent) : "Veli" }))
          );
        }
      })
      .catch((e) => {
      console.error("payment requests load", e);
      })
      .finally(() => {
        if (!cancelled) {
          setPaymentInfo(getPaymentInfo());
          setHydrated(true);
        }
      });
    const refresh = () => setPaymentInfo(getPaymentInfo());
    window.addEventListener(PROFILE_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PROFILE_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void writeUserState(STORAGE_KEY, requests).catch((e) => console.error("payment requests save", e));
  }, [requests, hydrated]);

  const accountHolder = paymentInfo.accountHolder || fullName || "Hesap sahibi";
  const ibanFilled = !!paymentInfo.iban.trim();

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ibanFilled) {
      showToast("Önce Ayarlar > IBAN bölümünden IBAN bilginizi girin.");
      return;
    }
    if (newReq.student && newReq.amount) {
      const selectedStudent = studentOptions.find((s) => s.name === newReq.student);
      setRequests([
        {
          id: Date.now(),
          student: newReq.student,
          parent: selectedStudent?.parent || "Veli",
          desc: newReq.desc || "Ders ücreti",
          amount: parseInt(newReq.amount, 10),
          date: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
          status: "pending",
        },
        ...requests,
      ]);
      setNewReq({ student: "", desc: "", amount: "" });
      setIsNewRequestOpen(false);
      showToast("Ödeme talebi veliye gönderildi! IBAN bilginiz veli ekranında görünecek.");
    }
  };

  const handleConfirm = (id: number) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "confirmed" } : r)));
    showToast("Ödeme onaylandı ve kayıt altına alındı.");
  };

  const handleMarkPaid = (id: number) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "paid" } : r)));
    showToast("Ödeme yapıldı olarak işaretlendi. Öğretmen onayını bekliyor.");
  };

  const handleDelete = (id: number) => {
    setRequests(requests.filter((r) => r.id !== id));
    showToast("Ödeme talebi silindi.");
  };

  const handleCopyIban = async () => {
    try {
      await navigator.clipboard.writeText(paymentInfo.iban.replace(/\s/g, ""));
      showToast("IBAN kopyalandı!");
    } catch {
      showToast("Kopyalama başarısız oldu.");
    }
  };

  const pendingTotal = requests.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0);
  const paidTotal = requests.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
  const confirmedTotal = requests.filter((r) => r.status === "confirmed").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="fixed top-20 right-4 sm:right-8 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-right-8 z-50 max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {userRole === "teacher" ? "Ödeme Talepleri" : "Ödemelerim"}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {userRole === "teacher"
              ? "Velilere ödeme talebi gönderin. IBAN bilginiz otomatik olarak veliye iletilir."
              : "Öğretmenin gönderdiği ödeme taleplerini görüntüleyin ve ödeme yapın."}
          </p>
        </div>
        {userRole === "teacher" && (
          <button
            onClick={() => setIsNewRequestOpen(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
          >
            <Send className="w-4 h-4" /> Ödeme Talebi Gönder
          </button>
        )}
      </div>

      {/* IBAN uyarısı */}
      {userRole === "teacher" && !ibanFilled && hydrated && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <Building2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-amber-900">IBAN bilginiz tanımlı değil</p>
            <p className="text-amber-800 mt-1">
              Ödeme talebi gönderebilmek için önce <a href="/dashboard/settings" className="underline font-bold">Ayarlar &gt; IBAN Bilgileri</a> bölümünden hesap bilgilerinizi girin.
            </p>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 items-start">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-blue-900">Nasıl Çalışır?</h4>
          <p className="text-sm text-blue-800 mt-1">
            {userRole === "teacher"
              ? 'Ödeme talebi oluşturduğunuzda, Ayarlar bölümünden girdiğiniz IBAN bilgileriniz otomatik olarak veliye gösterilir. Veli havale/EFT yaptıktan sonra "Ödedim" butonuna basar, siz de onaylarsınız. Hiçbir komisyon kesilmez.'
              : 'Öğretmen size bir ödeme talebi gönderir. Aşağıda gösterilen IBAN bilgilerine havale/EFT yaparak ödemenizi gerçekleştirin, ardından "Ödedim" butonuna basın.'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full z-0" />
          <div className="relative z-10">
            <p className="text-slate-500 font-medium mb-1">Bekleyen Talepler</p>
            <h3 className="text-3xl font-bold text-slate-800">₺{pendingTotal.toLocaleString("tr-TR")}</h3>
            <p className="text-sm text-orange-600 font-medium mt-2">
              {requests.filter((r) => r.status === "pending").length} talep bekliyor
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full z-0" />
          <div className="relative z-10">
            <p className="text-slate-500 font-medium mb-1">Onay Bekleyen</p>
            <h3 className="text-3xl font-bold text-slate-800">₺{paidTotal.toLocaleString("tr-TR")}</h3>
            <p className="text-sm text-blue-600 font-medium mt-2">Veli ödedi, onayınız bekleniyor</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full z-0" />
          <div className="relative z-10">
            <p className="text-slate-500 font-medium mb-1">Tamamlanan</p>
            <h3 className="text-3xl font-bold text-slate-800">₺{confirmedTotal.toLocaleString("tr-TR")}</h3>
            <p className="text-sm text-green-600 font-medium mt-2">Karşılıklı onaylandı</p>
          </div>
        </div>
      </div>

      {/* Request List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Ödeme Geçmişi</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {requests.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">Henüz ödeme talebi yok.</div>
          )}
          {requests.map((req) => (
            <div key={req.id} className="p-5 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4 flex-1 min-w-[260px]">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      req.status === "confirmed"
                        ? "bg-green-100 text-green-600"
                        : req.status === "paid"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {req.status === "confirmed" ? (
                      <Check className="w-5 h-5" />
                    ) : req.status === "paid" ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-bold text-slate-800">{req.desc}</h4>
                      {req.status === "pending" && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full uppercase">
                          Bekliyor
                        </span>
                      )}
                      {req.status === "paid" && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase">
                          Ödendi - Onay Bekliyor
                        </span>
                      )}
                      {req.status === "confirmed" && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">
                          Tamamlandı
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      Öğrenci: {req.student} • Veli: {req.parent} • {req.date}
                    </p>

                    {/* IBAN Bilgisi - Veli görsün */}
                    {userRole === "parent" && req.status === "pending" && (
                      <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ödeme Bilgileri</p>
                        {ibanFilled ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="text-sm text-slate-600">Hesap Sahibi:</span>
                              <span className="text-sm font-bold text-slate-800">{accountHolder}</span>
                            </div>
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="text-sm text-slate-600">Banka:</span>
                              <span className="text-sm font-bold text-slate-800">
                                {paymentInfo.bankName || "Belirtilmedi"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="text-sm text-slate-600">IBAN:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-800 font-mono break-all">
                                  {paymentInfo.iban}
                                </span>
                                <button
                                  onClick={handleCopyIban}
                                  className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                  title="Kopyala"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-amber-700">
                            Öğretmeniniz henüz IBAN bilgisini paylaşmadı. Lütfen onunla iletişime geçin.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xl font-extrabold text-slate-800 mb-2">
                    ₺{req.amount.toLocaleString("tr-TR")}
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    {userRole === "parent" && req.status === "pending" && (
                      <button
                        onClick={() => handleMarkPaid(req.id)}
                        className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Ödedim
                      </button>
                    )}
                    {userRole === "teacher" && req.status === "paid" && (
                      <button
                        onClick={() => handleConfirm(req.id)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Ödeme Geldi, Onayla
                      </button>
                    )}
                    {userRole === "teacher" && req.status === "pending" && (
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Request Modal */}
      {isNewRequestOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-primary-600" /> Ödeme Talebi Gönder
              </h3>
              <button
                onClick={() => setIsNewRequestOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendRequest} className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-xs text-green-800">
                <strong>Not:</strong> Talep gönderildiğinde velinin ekranında IBAN bilgileriniz ({paymentInfo.bankName || "banka tanımsız"} · {paymentInfo.iban || "IBAN tanımsız"}) otomatik olarak görünecektir. Komisyon kesilmez.
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Öğrenci / Veli Seç</label>
                <select
                  required
                  value={newReq.student}
                  onChange={(e) => setNewReq({ ...newReq, student: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="">Seçin...</option>
                  {studentOptions.map((student) => (
                    <option key={student.name} value={student.name}>
                      {student.name} · {student.parent}
                    </option>
                  ))}
                </select>
                {studentOptions.length === 0 && (
                  <p className="text-xs text-amber-700 mt-2">
                    Önce Öğrenci & Veli ekranından öğrenci ekleyin.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                <input
                  type="text"
                  value={newReq.desc}
                  onChange={(e) => setNewReq({ ...newReq, desc: e.target.value })}
                  placeholder="Örn: Haziran ayı ders ücretleri"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tutar (₺)</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={newReq.amount}
                  onChange={(e) => setNewReq({ ...newReq, amount: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 text-2xl font-bold text-center"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white font-medium py-2.5 rounded-lg hover:bg-primary-700 transition-colors mt-2"
              >
                Talebi Veliye Gönder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
