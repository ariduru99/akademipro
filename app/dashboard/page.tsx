"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  CreditCard,
  Users,
  Video,
  CheckCircle2,
  X,
  GraduationCap,
  Award,
  CheckSquare,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useProfile } from "@/lib/profile";
import {
  type ScheduleEvent,
  todayISODate,
  todayScheduleDay,
  formatScheduleEventLabel,
} from "@/lib/scheduleSync";
import { readUserState, writeUserState } from "@/lib/appState";

type Approval = { id: number; text: string; detail: string };
type Announcement = { id: number; title: string; text: string; target: string };

const HOMEWORKS: Array<{
  id: number;
  subject: string;
  desc: string;
  deadline: string;
  student: string;
  files: Array<{ name: string; size: string; date: string }>;
}> = [];

export default function Dashboard() {
  const { hydrated, role: userRole, firstName } = useProfile();

  const defaultApprovals: Approval[] = [];
  const defaultAnnouncements: Announcement[] = [];

  const [approvals, setApprovals] = useState<Approval[]>(defaultApprovals);
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [studentsCount, setStudentsCount] = useState<number | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);
  const [pendingPaymentTotal, setPendingPaymentTotal] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      readUserState<Announcement[]>("dashboard_announcements", defaultAnnouncements),
      readUserState<Approval[]>("dashboard_approvals", defaultApprovals),
      readUserState<ScheduleEvent[]>("schedule_data", []),
      readUserState<Array<unknown>>("students_data", []),
      readUserState<Array<{ amount: number; status: string }>>("payment_requests", []),
    ])
      .then(([savedAnn, savedApp, sched, students, payments]) => {
        if (cancelled) return;
        if (Array.isArray(savedAnn)) setAnnouncements(savedAnn);
        if (Array.isArray(savedApp)) setApprovals(savedApp);
        if (Array.isArray(sched)) setSchedule(sched);
        if (Array.isArray(students)) setStudentsCount(students.length);
        if (Array.isArray(payments)) {
          setConfirmedTotal(payments.filter((r) => r.status === "confirmed").reduce((s, r) => s + r.amount, 0));
          setPendingPaymentTotal(payments.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0));
        }
      })
      .catch((e) => {
      console.error("dashboard data load", e);
      })
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isLoaded) void writeUserState("dashboard_announcements", announcements).catch((e) => console.error("announcements save", e));
  }, [announcements, isLoaded]);

  useEffect(() => {
    if (isLoaded) void writeUserState("dashboard_approvals", approvals).catch((e) => console.error("approvals save", e));
  }, [approvals, isLoaded]);

  const todayIso = useMemo(() => todayISODate(), []);
  const todayIndex = useMemo(() => todayScheduleDay(), []);

  const todayEvents = useMemo(() => {
    return schedule
      .filter((s) => {
        if (s.date) return s.date === todayIso;
        return s.day === todayIndex;
      })
      .filter((s) => s.type !== "personal")
      .sort((a, b) => a.hour - b.hour);
  }, [schedule, todayIso, todayIndex]);

  const todayClassesCount = todayEvents.length;

  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: "", text: "", target: "Tüm Öğrenciler" });
  const [editAnnId, setEditAnnId] = useState<number | null>(null);
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [expandedHwId, setExpandedHwId] = useState<number | null>(null);

  const handleApprove = (id: number) => setApprovals(approvals.filter((a) => a.id !== id));

  const handleAddAnn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnn.title || !newAnn.text) return;
    if (editAnnId) {
      setAnnouncements(announcements.map((a) => (a.id === editAnnId ? { ...a, ...newAnn } : a)));
      setEditAnnId(null);
    } else {
      setAnnouncements([...announcements, { id: Date.now(), ...newAnn }]);
    }
    setNewAnn({ title: "", text: "", target: "Tüm Öğrenciler" });
    setIsAnnModalOpen(false);
  };

  const handleEditAnn = (ann: Announcement) => {
    setEditAnnId(ann.id);
    setNewAnn({ title: ann.title, text: ann.text, target: ann.target });
    setIsAnnModalOpen(true);
  };

  const handleDeleteAnn = (id: number) => setAnnouncements(announcements.filter((a) => a.id !== id));

  const teacherStudentsLabel = studentsCount ?? "—";
  const monthlyEarningsLabel = confirmedTotal ? `₺${confirmedTotal.toLocaleString("tr-TR")}` : "—";

  const greeting = hydrated ? firstName || "Hoş geldiniz" : "Merhaba";

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">İyi Günler, {greeting}</h2>
        {userRole === "teacher" && (
          <p className="text-slate-500">
            Bugün {todayClassesCount} dersiniz ve {approvals.length} onay bekleyen işleminiz var.
          </p>
        )}
        {userRole === "student" && (
          <p className="text-slate-500">
            Bugün {todayClassesCount} dersin ve {HOMEWORKS.length} adet bekleyen ödevin var. Başarılar.
          </p>
        )}
        {userRole === "parent" && (
          <p className="text-slate-500">
            Çocuğunuzun bugün {todayClassesCount} dersi var. Bekleyen fatura tutarınız: ₺{pendingPaymentTotal.toLocaleString("tr-TR")}.
          </p>
        )}
      </div>

      {/* Stats Grid - Role Based */}
      {userRole === "teacher" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Link
            prefetch={false}
            href="/dashboard/schedule"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Bugünkü Dersler</p>
                <p className="text-2xl font-bold text-slate-800">{todayClassesCount}</p>
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsHomeworkModalOpen(true)}
            className="text-left bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Bekleyen Ödevler</p>
                <p className="text-2xl font-bold text-slate-800">{HOMEWORKS.length}</p>
              </div>
            </div>
          </button>
          <Link
            prefetch={false}
            href="/dashboard/payments"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-green-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Tamamlanan Gelir</p>
                <p className="text-2xl font-bold text-slate-800">{monthlyEarningsLabel}</p>
              </div>
            </div>
          </Link>
          <Link
            prefetch={false}
            href="/dashboard/students"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Toplam Öğrenci</p>
                <p className="text-2xl font-bold text-slate-800">{teacherStudentsLabel}</p>
              </div>
            </div>
          </Link>
        </div>
      ) : userRole === "student" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Link
            prefetch={false}
            href="/dashboard/schedule"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Gireceğim Dersler</p>
                <p className="text-2xl font-bold text-slate-800">{todayClassesCount}</p>
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsHomeworkModalOpen(true)}
            className="text-left bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Verilen Ödevler</p>
                <p className="text-2xl font-bold text-slate-800">{HOMEWORKS.length}</p>
              </div>
            </div>
          </button>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Kazanılan Puan</p>
                <p className="text-2xl font-bold text-slate-800">450</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Doğru Sayısı</p>
                <p className="text-2xl font-bold text-slate-800">85</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Link
            prefetch={false}
            href="/dashboard/schedule"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Çocuğumun Dersleri</p>
                <p className="text-2xl font-bold text-slate-800">{todayClassesCount}</p>
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsHomeworkModalOpen(true)}
            className="text-left bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Bekleyen Ödevler</p>
                <p className="text-2xl font-bold text-slate-800">{HOMEWORKS.length}</p>
              </div>
            </div>
          </button>
          <Link
            prefetch={false}
            href="/dashboard/payments"
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-red-200 transition-all cursor-pointer group sm:col-span-2"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Bekleyen Fatura Tutarı</p>
                <p className="text-2xl font-bold text-slate-800">₺{pendingPaymentTotal.toLocaleString("tr-TR")}</p>
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">
              {userRole === "teacher" ? "Bugünkü Ders Odaları" : "Yaklaşan Dersler"}
            </h3>
            <Link prefetch={false} href="/dashboard/rooms" className="text-sm font-medium text-primary-600 hover:underline">
              Tümünü Gör
            </Link>
          </div>

          <div className="space-y-4">
            {todayEvents.length === 0 && (
              <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-300 text-center text-sm text-slate-500">
                Bugün için planlanmış ders bulunmuyor. Yeni eklemek için{" "}
                <Link prefetch={false} href="/dashboard/schedule" className="text-primary-600 font-bold underline">
                  Ders Programı
                </Link>{" "}
                sayfasına gidin.
              </div>
            )}
            {todayEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-3"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-14 h-14 rounded-xl bg-${ev.color}-100 flex items-center justify-center text-${ev.color}-600 font-bold text-lg shrink-0`}>
                    {ev.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{ev.title}</h4>
                    <p className="text-sm text-slate-500 truncate">{formatScheduleEventLabel(ev)}</p>
                  </div>
                </div>
                <Link
                  prefetch={false}
                  href={`/dashboard/rooms/SC-${ev.id}`}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                  Odaya Katıl
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Duyurular</h3>
            {userRole === "teacher" && (
              <button
                type="button"
                onClick={() => setIsAnnModalOpen(true)}
                className="text-sm font-medium text-primary-600 hover:underline"
              >
                + Yeni
              </button>
            )}
          </div>

          <div className="space-y-4 mb-6">
            {announcements.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                Henüz duyuru yok.
              </div>
            )}
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-yellow-50 p-5 rounded-2xl border border-yellow-200 relative group">
                {userRole === "teacher" && (
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      onClick={() => handleEditAnn(ann)}
                      className="p-1.5 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                      title="Düzenle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnn(ann.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="text-xs font-bold text-yellow-600 mb-1 uppercase tracking-wider">{ann.target}</div>
                <h4 className="font-bold text-yellow-800 mb-2 pr-16">{ann.title}</h4>
                <p className="text-sm text-yellow-700">{ann.text}</p>
              </div>
            ))}
          </div>

          {userRole === "teacher" && (
            <>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Bekleyen Onaylar</h3>
              <div className="space-y-3">
                {approvals.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-2 flex-wrap"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{app.text}</p>
                      <p className="text-xs text-slate-500 truncate">{app.detail}</p>
                    </div>
                    <button
                      onClick={() => handleApprove(app.id)}
                      className="text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Onayla
                    </button>
                  </div>
                ))}
                {approvals.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                    Bekleyen onay yok.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Homework Details Modal */}
      {isHomeworkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-500" /> Bekleyen Ödev Detayları
              </h3>
              <button
                onClick={() => setIsHomeworkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {HOMEWORKS.map((hw) => (
                <div
                  key={hw.id}
                  className="border border-slate-200 rounded-xl p-4 hover:border-orange-200 transition-colors bg-white"
                >
                  <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-800">{hw.subject}</h4>
                    <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      {hw.deadline}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{hw.desc}</p>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3 flex-wrap gap-2">
                    <span className="text-xs font-medium text-slate-500">Öğrenci: {hw.student}</span>
                    <button
                      onClick={() => setExpandedHwId(expandedHwId === hw.id ? null : hw.id)}
                      className="text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3" /> {expandedHwId === hw.id ? "Dosyaları Gizle" : "Dosyaları Gör"}
                    </button>
                  </div>
                  {expandedHwId === hw.id && (
                    <div className="mt-3 border-t border-slate-100 pt-3 space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Yüklenen Dosyalar ({hw.files.length})
                      </p>
                      {hw.files.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 hover:border-primary-200 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                              {file.name.split(".").pop()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                              <p className="text-[10px] text-slate-400">
                                {file.size} • {file.date}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">Yüklenen dosya</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Announcement Modal */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">
                {editAnnId ? "Duyuruyu Düzenle" : "Yeni Duyuru Ekle"}
              </h3>
              <button
                onClick={() => {
                  setIsAnnModalOpen(false);
                  setEditAnnId(null);
                  setNewAnn({ title: "", text: "", target: "Tüm Öğrenciler" });
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAnn} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duyuru Başlığı</label>
                <input
                  required
                  type="text"
                  value={newAnn.title}
                  onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hedef Kitle</label>
                <select
                  value={newAnn.target}
                  onChange={(e) => setNewAnn({ ...newAnn, target: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 cursor-pointer"
                >
                  <option value="Tüm Öğrenciler">Tüm Öğrenciler</option>
                  <option value="Tüm Veliler">Tüm Veliler</option>
                  <option value="Belirli Grup">Belirli Grup</option>
                  <option value="Tek Öğrenci">Tek Öğrenci</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duyuru İçeriği</label>
                <textarea
                  required
                  rows={4}
                  value={newAnn.text}
                  onChange={(e) => setNewAnn({ ...newAnn, text: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white font-medium py-2.5 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                {editAnnId ? "Güncelle" : "Duyuruyu Yayınla"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
