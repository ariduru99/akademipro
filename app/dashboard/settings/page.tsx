"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  User,
  Lock,
  Bell,
  Save,
  CheckCircle2,
  Building,
  Receipt,
  AlertTriangle,
  Mail,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Send,
  Inbox,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  fetchOutbox,
  getBrowserPermission,
  requestBrowserNotificationPermission,
  sendNotification,
  type BrowserPermission,
  type ChannelDispatchResult,
  type OutboxEntry,
  type ProvidersStatus,
} from "@/lib/notifications";
import {
  type AppSettings,
  DEFAULT_SETTINGS,
  getStoredSettings,
  persistSettings,
  setAvatar,
  useProfile,
} from "@/lib/profile";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export default function SettingsPage() {
  const [toast, setToast] = useState("");
  const [activeSection, setActiveSection] = useState("profile");
  const { avatar, initials, settings: profileSettings, hydrated: profileHydrated } = useProfile();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSynced, setIsSynced] = useState(false);

  const [pwError, setPwError] = useState<string | null>(null);
  const [pwOk, setPwOk] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    // Only update if we are hydrated and our current fields are empty (likely first load)
    if (profileHydrated && (!settings.fullName || settings.fullName === "")) {
      const latest = getStoredSettings();
      if (latest.fullName) {
        setSettings(latest);
      } else if (profileSettings.fullName) {
        setSettings(profileSettings);
      }
    }
  }, [profileHydrated, profileSettings, settings.fullName]);




  const [browserPerm, setBrowserPerm] = useState<BrowserPermission>("default");
  const [providers, setProviders] = useState<ProvidersStatus | null>(null);
  const [outbox, setOutbox] = useState<OutboxEntry[]>([]);
  const [outboxLoading, setOutboxLoading] = useState(false);
  const [testResults, setTestResults] = useState<ChannelDispatchResult[] | null>(null);
  const [testResultsAt, setTestResultsAt] = useState<number | null>(null);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [highlightedOutboxIds, setHighlightedOutboxIds] = useState<string[]>([]);

  const refreshOutbox = useCallback(async () => {
    setOutboxLoading(true);
    const data = await fetchOutbox();
    if (data) {
      setOutbox(data.entries);
      setProviders(data.providers);
    }
    setOutboxLoading(false);
  }, []);

  useEffect(() => {
    setBrowserPerm(getBrowserPermission());
    void refreshOutbox();
  }, [refreshOutbox]);

  useEffect(() => {
    if (activeSection === "notifications") void refreshOutbox();
  }, [activeSection, refreshOutbox]);

  const handleAskBrowserPermission = async () => {
    const result = await requestBrowserNotificationPermission();
    setBrowserPerm(result);
    if (result === "granted") showToast("Tarayıcı bildirimleri etkinleştirildi.");
    else if (result === "denied") showToast("Tarayıcı izin vermedi. Site ayarlarından açabilirsiniz.");
  };

  const handleTestNotify = async (channels?: ("app" | "email")[]) => {
    persistSettings(settings);
    setTestingChannel(channels ? channels.join(",") : "all");
    const beforeIds = new Set(outbox.map((e) => e.id));
    const results = await sendNotification({
      title: "Akademi Pro test bildirimi",
      body: `Merhaba ${settings.fullName.split(" ")[0] || "orada"}! Bu bir test bildirimidir — kanallarınız çalışıyor.`,
      kind: "system",
      channels,
    });
    setTestResults(results);
    setTestResultsAt(Date.now());
    setTestingChannel(null);

    const summary = results
      .map((r) => {
        const label = r.channel === "app" ? "Uygulama" : "E-posta";
        const tag =
          r.status === "sent"
            ? "gönderildi"
            : r.status === "queued"
              ? "kuyruğa alındı (demo)"
              : r.status === "skipped"
                ? "atlandı"
                : "hata";
        return `${label}: ${tag}`;
      })
      .join(" · ");
    showToast(summary || "Hiçbir kanal aktif değil.");

    const data = await fetchOutbox();
    if (data) {
      setOutbox(data.entries);
      setProviders(data.providers);
      const newIds = data.entries.filter((e) => !beforeIds.has(e.id)).map((e) => e.id);
      if (newIds.length) {
        setHighlightedOutboxIds(newIds);
        setTimeout(() => setHighlightedOutboxIds([]), 6000);
      }
    }
  };

  const handleSave = () => {
    persistSettings(settings);
    showToast("Değişiklikler başarıyla kaydedildi!");
  };

  const handleChangePassword = () => {
    setPwError(null);
    setPwOk(null);
    if (!settings.currentPassword) {
      setPwError("Mevcut şifrenizi girin.");
      return;
    }
    if (!settings.newPassword || settings.newPassword.length < 8) {
      setPwError("Yeni şifre en az 8 karakter olmalı.");
      return;
    }
    if (settings.currentPassword === settings.newPassword) {
      setPwError("Yeni şifre, mevcut şifreden farklı olmalı.");
      return;
    }
    setSettings({ ...settings, currentPassword: "", newPassword: "" });
    setPwOk(
      "Şifre değişikliği şu an yerel olarak doğrulanır; gerçek doğrulama Supabase entegrasyonu sonrası aktif olacak."
    );
    setTimeout(() => setPwOk(null), 6000);
  };

  const handlePickAvatar = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setAvatarError("Lütfen bir görsel dosyası seçin.");
      return;
    }
    if (f.size > MAX_AVATAR_BYTES) {
      setAvatarError("Dosya 2 MB sınırını aşıyor.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : null;
      if (!dataUrl) return;
      setAvatar(dataUrl);
      showToast("Profil fotoğrafı güncellendi.");
    };
    reader.onerror = () => setAvatarError("Dosya okunamadı.");
    reader.readAsDataURL(f);
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    showToast("Profil fotoğrafı kaldırıldı.");
  };

  const handleDownloadIncomeReport = () => {
    try {
      const raw = localStorage.getItem("payment_requests");
      const list = raw ? (JSON.parse(raw) as Array<{ amount: number; date: string; status: string; desc?: string; student?: string }>) : [];
      const confirmed = list.filter((r) => r.status === "confirmed");
      const csv = [
        ["Tarih", "Öğrenci", "Açıklama", "Tutar (TRY)"],
        ...confirmed.map((r) => [r.date, r.student || "-", r.desc || "-", String(r.amount)]),
      ]
        .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AkademiPro-gelir-raporu-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Gelir raporu indirildi.");
    } catch {
      showToast("Rapor oluşturulurken bir sorun oluştu.");
    }
  };

  const navItems = [
    { id: "profile", label: "Profil Bilgileri", icon: User },
    { id: "password", label: "Şifre & Güvenlik", icon: Lock },
    { id: "notifications", label: "Bildirimler", icon: Bell },
    { id: "payment", label: "IBAN Bilgileri", icon: Building },
    { id: "tax", label: "Vergi Bilgileri", icon: Receipt },
  ];

  const avatarInitial = (settings.fullName || "?")
    .split(" ")
    .map((p) => p.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || initials || "?";

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      {toast && (
        <div className="fixed top-20 right-4 sm:right-8 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-right-8 z-50 max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleAvatarChange}
      />

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Ayarlar</h2>
        <p className="text-slate-500 text-sm mt-1">Hesap, ödeme ve vergi bilgilerinizi yönetin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        <div className="col-span-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors text-left ${
                activeSection === item.id
                  ? "font-bold text-primary-700 bg-primary-50"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
        </div>

        <div className="col-span-1 md:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* PROFILE */}
            {activeSection === "profile" && (
              <>
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800">Profil Bilgileri</h3>
                  <p className="text-sm text-slate-500 mt-1">Sistemdeki temel bilgilerinizi buradan güncelleyebilirsiniz.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-3xl font-bold border-4 border-white shadow-md overflow-hidden">
                      {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatar} alt="Profil" className="w-full h-full object-cover" />
                      ) : (
                        avatarInitial
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <button
                          type="button"
                          onClick={handlePickAvatar}
                          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                        >
                          Fotoğraf Değiştir
                        </button>
                        {avatar && (
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors shadow-sm"
                          >
                            Kaldır
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">Önerilen boyut: 400x400px, Maks: 2MB.</p>
                      {avatarError && <p className="text-xs text-red-600 mt-1">{avatarError}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Ad Soyad</label>
                      <input
                        type="text"
                        value={settings.fullName}
                        onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                      <input
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Şehir</label>
                      <input
                        type="text"
                        value={settings.city}
                        onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* PASSWORD */}
            {activeSection === "password" && (
              <>
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800">Şifre & Güvenlik</h3>
                  <p className="text-sm text-slate-500 mt-1">Hesap güvenliğinizi sağlamak için şifrenizi güncelleyin.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Mevcut Şifre</label>
                    <div className="relative">
                      <input
                        type={showCurrent ? "text" : "password"}
                        value={settings.currentPassword}
                        onChange={(e) => setSettings({ ...settings, currentPassword: e.target.value })}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                        aria-label={showCurrent ? "Gizle" : "Göster"}
                      >
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Yeni Şifre</label>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={settings.newPassword}
                        onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
                        placeholder="En az 8 karakter"
                        autoComplete="new-password"
                        className="w-full px-4 py-2 pr-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                        aria-label={showNew ? "Gizle" : "Göster"}
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {pwError && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700">{pwError}</div>
                  )}
                  {pwOk && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-800">{pwOk}</div>
                  )}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                    <strong>İpucu:</strong> Güçlü bir şifre için büyük/küçük harf, rakam ve özel karakter kullanın.
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 transition-colors"
                    >
                      Şifreyi Güncelle
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* NOTIFICATIONS */}
            {activeSection === "notifications" && (
              <>
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary-600" /> Bildirim Tercihleri
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Hangi kanalları açacağınızı seçin, test bildirimi gönderin ve son aktiviteleri görün.</p>
                </div>
                <div className="p-6 space-y-6">
                  {providers && !providers.email.configured && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1 text-sm">
                          <p className="font-bold text-amber-900">Demo modu — gerçek e-posta gönderilmiyor</p>
                          <p className="text-amber-800 mt-1">
                            Test edilen e-postalar yalnızca aşağıdaki <strong>outbox</strong> tablosuna kaydediliyor.
                          </p>
                          <details className="mt-2 text-xs text-amber-900">
                            <summary className="cursor-pointer font-bold">Gerçek gönderim nasıl açılır?</summary>
                            <div className="mt-2 space-y-3">
                              <div>
                                <p className="font-bold">E-posta (Resend):</p>
                                <ol className="list-decimal pl-4 space-y-0.5 mt-1">
                                  <li>
                                    <a
                                      href="https://resend.com"
                                      target="_blank"
                                      rel="noreferrer"
                                      className="underline"
                                    >
                                      resend.com
                                    </a>{" "}
                                    üzerinden ücretsiz hesap aç (günlük 100 e-posta).
                                  </li>
                                  <li>API Keys ekranından bir anahtar üret.</li>
                                  <li>
                                    Proje köküne <span className="font-mono bg-amber-100 px-1 rounded">.env.local</span> ekleyip iki satır yaz:
                                  </li>
                                </ol>
                                <pre className="font-mono bg-amber-100/70 rounded p-2 mt-1 whitespace-pre-wrap">
                                  RESEND_API_KEY=re_xxxxxxxx{"\n"}
                                  NOTIFY_EMAIL_FROM=&quot;Akademi Pro &lt;onboarding@resend.dev&gt;&quot;
                                </pre>
                              </div>
                              <p>
                                Env değişkenlerini ekledikten sonra <span className="font-mono">dev server</span>&apos;ı durdurup yeniden başlatın.
                              </p>
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <Smartphone className="w-5 h-5 text-primary-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">Uygulama İçi Bildirimler</p>
                          <p className="text-xs text-slate-500">Sağ üstteki çan menüsü ve tarayıcı bildirimleri</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifApp}
                        onChange={(e) => setSettings({ ...settings, notifApp: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-primary-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-800">E-posta Bildirimleri</p>
                          <p className="text-xs text-slate-500">
                            Profilinizdeki adrese gönderilir:{" "}
                            <span className="font-mono text-slate-700">{settings.email || "tanımsız"}</span>
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifEmail}
                        onChange={(e) => setSettings({ ...settings, notifEmail: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded"
                      />
                    </label>
                  </div>

                  <div
                    className={`rounded-xl border p-4 flex items-start gap-3 ${
                      browserPerm === "granted"
                        ? "bg-emerald-50 border-emerald-200"
                        : browserPerm === "denied"
                          ? "bg-red-50 border-red-200"
                          : browserPerm === "unsupported"
                            ? "bg-slate-50 border-slate-200"
                            : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    {browserPerm === "granted" ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 text-sm">
                      <p className="font-bold text-slate-800">Tarayıcı bildirimleri</p>
                      <p className="text-slate-600 mt-0.5">
                        {browserPerm === "granted" && "Etkin — uygulama dışındayken bile masaüstü bildirimi alacaksınız."}
                        {browserPerm === "denied" && "Reddedildi. Tarayıcınızın site ayarlarından bildirim iznini açmanız gerekiyor."}
                        {browserPerm === "unsupported" && "Tarayıcınız bu özelliği desteklemiyor."}
                        {browserPerm === "default" && "Henüz izin istenmedi. Aşağıdaki düğmeden etkinleştirin."}
                      </p>
                    </div>
                    {browserPerm === "default" && (
                      <button
                        type="button"
                        onClick={handleAskBrowserPermission}
                        className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 transition-colors"
                      >
                        İzin Ver
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" /> Ders öncesi hatırlat
                      </label>
                      <select
                        value={settings.reminderMinutes}
                        onChange={(e) => setSettings({ ...settings, reminderMinutes: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                      >
                        <option value={5}>5 dakika önce</option>
                        <option value={15}>15 dakika önce</option>
                        <option value={30}>30 dakika önce</option>
                        <option value={60}>1 saat önce</option>
                        <option value={0}>Gönderme</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Sessiz mod başlangıç</label>
                      <input
                        type="time"
                        value={settings.quietStart}
                        onChange={(e) => setSettings({ ...settings, quietStart: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Sessiz mod bitiş</label>
                      <input
                        type="time"
                        value={settings.quietEnd}
                        onChange={(e) => setSettings({ ...settings, quietEnd: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 -mt-2">
                    Sessiz saatlerde uygulama içi bildirimler listeye düşer ama sesli/masaüstü bildirimi tetiklemez.
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    <div
                      className={`rounded-xl border p-3 ${
                        providers?.email.configured ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <Mail className="w-4 h-4 text-primary-600" /> E-posta sağlayıcı
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{providers?.email.provider ?? "..."}</p>
                      {!providers?.email.configured && (
                        <p className="text-[11px] text-slate-500 mt-1">
                          Gerçek gönderim için <span className="font-mono">RESEND_API_KEY</span> +{" "}
                          <span className="font-mono">NOTIFY_EMAIL_FROM</span> env tanımlayın.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 bg-white">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Send className="w-4 h-4 text-primary-600" /> Test bildirimi
                        </h4>
                        <p className="text-xs text-slate-500">Aktif kanallarınıza anlık bir test gönderir.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTestNotify()}
                        disabled={testingChannel !== null}
                        className="px-3 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
                      >
                        {testingChannel === "all" ? "Gönderiliyor…" : "Tüm aktif kanallar"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleTestNotify(["app"])}
                        disabled={testingChannel !== null}
                        className="text-xs font-medium px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        <Smartphone className="w-3.5 h-3.5" /> Uygulama
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTestNotify(["email"])}
                        disabled={testingChannel !== null}
                        className="text-xs font-medium px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        <Mail className="w-3.5 h-3.5" /> E-posta
                      </button>
                    </div>
                    {testResults && testResults.length > 0 && (
                      <div className="mt-4 rounded-lg border border-slate-200 overflow-hidden">
                        <div className="px-3 py-2 bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>
                            Test sonucu {testResultsAt && `· ${new Date(testResultsAt).toLocaleTimeString("tr-TR")}`}
                          </span>
                          <button type="button" onClick={() => setTestResults(null)} className="text-slate-500 hover:text-slate-700">
                            Kapat
                          </button>
                        </div>
                        <ul className="divide-y divide-slate-100">
                          {testResults.map((r, i) => {
                            const labelMap = { app: "Uygulama içi", email: "E-posta", sms: "SMS" } as const;
                            const Icon = r.channel === "app" ? Smartphone : Mail;
                            const colorClasses =
                              r.status === "sent"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : r.status === "queued"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : r.status === "skipped"
                                    ? "bg-slate-50 text-slate-600 border-slate-200"
                                    : "bg-red-50 text-red-700 border-red-200";
                            const statusText =
                              r.status === "sent"
                                ? "Gönderildi"
                                : r.status === "queued"
                                  ? "Demo · Outbox'a yazıldı"
                                  : r.status === "skipped"
                                    ? "Atlandı"
                                    : "Hata";
                            return (
                              <li key={i} className="flex items-start gap-3 px-3 py-2.5 text-sm">
                                <Icon className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                <span className="font-bold text-slate-800 w-24 shrink-0 mt-0.5">{labelMap[r.channel]}</span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap shrink-0 ${colorClasses}`}
                                >
                                  {statusText}
                                </span>
                                {r.message && <span className="text-xs text-slate-600 break-words flex-1">{r.message}</span>}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Inbox className="w-4 h-4 text-primary-600" /> Son gönderim kayıtları
                      </h4>
                      <button
                        type="button"
                        onClick={refreshOutbox}
                        className="text-xs font-medium text-slate-600 hover:text-primary-600 flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${outboxLoading ? "animate-spin" : ""}`} /> Yenile
                      </button>
                    </div>
                    {outbox.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">Henüz gönderim yapılmadı.</div>
                    ) : (
                      <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                        {outbox.map((entry) => {
                          const isNew = highlightedOutboxIds.includes(entry.id);
                          return (
                            <li
                              key={entry.id}
                              className={`px-4 py-3 text-sm flex items-start gap-3 transition-colors ${
                                isNew ? "bg-amber-50 ring-1 ring-amber-300" : ""
                              }`}
                            >
                              <span
                                className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  entry.channel === "email"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {entry.channel}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-slate-800 truncate">{entry.title}</p>
                                  {isNew && (
                                    <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[9px] font-bold">
                                      YENİ
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 truncate">{entry.body}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  → {entry.to} · {entry.provider} · {new Date(entry.createdAt).toLocaleString("tr-TR")}
                                </p>
                              </div>
                              <span
                                className={`text-[10px] font-bold uppercase shrink-0 ${
                                  entry.status === "sent"
                                    ? "text-emerald-600"
                                    : entry.status === "queued"
                                      ? "text-amber-600"
                                      : "text-red-600"
                                }`}
                              >
                                {entry.status}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* IBAN */}
            {activeSection === "payment" && (
              <>
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Building className="w-5 h-5 text-green-600" /> IBAN Bilgileri
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Ödeme talebi gönderdiğinizde veliye gösterilecek banka bilgileri.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
                    <strong>Nasıl çalışır?</strong> Ödeme talebi oluşturduğunuzda, burada girdiğiniz IBAN bilgileri veliye otomatik olarak gösterilir. Veli havale/EFT yapar ve &quot;Ödedim&quot; butonuna basar. Siz de onaylarsınız. <strong>Hiçbir komisyon kesilmez.</strong>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Hesap Sahibi (Ad Soyad)</label>
                    <input
                      type="text"
                      value={settings.accountHolder}
                      onChange={(e) => setSettings({ ...settings, accountHolder: e.target.value })}
                      placeholder="Hesap sahibinin tam adı"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">Boş bırakırsanız profil adınız kullanılır.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Banka Adı</label>
                    <select
                      value={settings.bankName}
                      onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white cursor-pointer"
                    >
                      <option value="">Banka seçin...</option>
                      <option>Ziraat Bankası</option>
                      <option>Garanti BBVA</option>
                      <option>İş Bankası</option>
                      <option>Yapı Kredi</option>
                      <option>Akbank</option>
                      <option>Halkbank</option>
                      <option>Vakıfbank</option>
                      <option>QNB Finansbank</option>
                      <option>Denizbank</option>
                      <option>ING Bank</option>
                      <option>Enpara</option>
                      <option>Papara</option>
                      <option>Diğer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">IBAN Numarası</label>
                    <input
                      type="text"
                      value={settings.iban}
                      onChange={(e) => setSettings({ ...settings, iban: e.target.value.toUpperCase() })}
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                      maxLength={32}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-mono tracking-wider"
                    />
                    <p className="text-xs text-slate-500 mt-1">Bu bilgi sadece ödeme talebi gönderdiğinizde ilgili veliye gösterilir.</p>
                  </div>
                </div>
              </>
            )}

            {/* TAX INFO */}
            {activeSection === "tax" && (
              <>
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-orange-600" /> Vergi Bilgileri
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Freelancer eğitmenler için vergi bilgileri. Gelir takibiniz için kullanılır.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <strong>Bilgilendirme:</strong> Serbest meslek erbabı olarak elde ettiğiniz gelirleri vergi beyannamenizde beyan etmeniz gerekmektedir. Akademi Pro ödeme geçmişinizi raporlayarak vergi döneminizde kolaylık sağlar. <strong>Platform herhangi bir vergi kesintisi yapmaz</strong>, sorumluluk size aittir.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">TC Kimlik No</label>
                      <input
                        type="text"
                        value={settings.tcKimlik}
                        onChange={(e) => setSettings({ ...settings, tcKimlik: e.target.value.replace(/\D/g, "") })}
                        placeholder="10000000000"
                        maxLength={11}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Vergi Dairesi</label>
                      <input
                        type="text"
                        value={settings.vergiDairesi}
                        onChange={(e) => setSettings({ ...settings, vergiDairesi: e.target.value })}
                        placeholder="Örn: Kadıköy V.D."
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Vergi Numarası (Varsa)</label>
                      <input
                        type="text"
                        value={settings.vergiNo}
                        onChange={(e) => setSettings({ ...settings, vergiNo: e.target.value })}
                        placeholder="Şahıs şirketi yoksa boş bırakın"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Çalışma Şekli</label>
                      <select
                        value={settings.isFreelancer ? "freelancer" : "company"}
                        onChange={(e) =>
                          setSettings({ ...settings, isFreelancer: e.target.value === "freelancer" })
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white cursor-pointer"
                      >
                        <option value="freelancer">Serbest Meslek (Freelancer)</option>
                        <option value="company">Şahıs Şirketi / Ltd. Şti.</option>
                      </select>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div>
                    <h4 className="font-bold text-slate-800 mb-3">Gelir Raporu</h4>
                    <p className="text-sm text-slate-500 mb-4">
                      Onaylanmış ödemelerinizi içeren CSV raporunu indirebilirsiniz.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={handleDownloadIncomeReport}
                        className="flex-1 min-w-[200px] bg-white border border-slate-200 text-slate-700 py-2.5 px-4 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm"
                      >
                        Onaylı Ödemeleri CSV İndir
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Save Button */}
            {activeSection !== "password" && activeSection !== "notifications" && (
              <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
                >
                  <Save className="w-4 h-4" /> Değişiklikleri Kaydet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
