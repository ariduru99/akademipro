"use client";

import { useState, useEffect, useCallback, useRef, ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Calendar,
  CreditCard,
  LayoutDashboard,
  MessageCircle,
  Settings,
  Users,
  Video,
  ChevronDown,
  LogOut,
  Check,
  Trash2,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  type AppNotification,
  NOTIFICATIONS_UPDATED_EVENT,
  clearAllNotifications,
  getStoredAppNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";
import { useProfile } from "@/lib/profile";
import { logoutClient } from "@/lib/authAccounts";
import { seedDemoData } from "@/lib/dataSeeder";


const STATUS_KEY = "user_status";
const STATUS_OPTIONS = ["Online", "Meşgul", "Derste", "Çevrimdışı"] as const;
type StatusValue = (typeof STATUS_OPTIONS)[number];

function statusColor(s: string) {
  switch (s) {
    case "Online":
      return "bg-green-500";
    case "Meşgul":
      return "bg-orange-500";
    case "Derste":
      return "bg-red-500";
    case "Çevrimdışı":
      return "bg-slate-400";
    default:
      return "bg-green-500";
  }
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} sa önce`;
  const days = Math.floor(hrs / 24);
  return `${days} gün önce`;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { hydrated, session, role: userRole, fullName, initials, avatar } = useProfile();
  const [status, setStatus] = useState<StatusValue>("Online");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const notifBtnRef = useRef<HTMLDivElement>(null);
  const statusBtnRef = useRef<HTMLDivElement>(null);

  const refreshNotifications = useCallback(() => {
    const list = getStoredAppNotifications().sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
    setNotifications(list);
  }, []);

  useEffect(() => {
    if (!hydrated || session) return;
    router.replace("/login");
  }, [hydrated, session, router]);

  useEffect(() => {
    seedDemoData();
    refreshNotifications();

    const onChange = () => refreshNotifications();
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    try {
      const saved = localStorage.getItem(STATUS_KEY);
      if (saved && STATUS_OPTIONS.includes(saved as StatusValue)) {
        setStatus(saved as StatusValue);
      }
    } catch {
      /* ignore */
    }
    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refreshNotifications]);

  useEffect(() => {
    if (!showNotifMenu && !showStatusMenu) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        showNotifMenu &&
        notifBtnRef.current &&
        !notifBtnRef.current.contains(t)
      ) {
        setShowNotifMenu(false);
      }
      if (
        showStatusMenu &&
        statusBtnRef.current &&
        !statusBtnRef.current.contains(t)
      ) {
        setShowStatusMenu(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowNotifMenu(false);
        setShowStatusMenu(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showNotifMenu, showStatusMenu]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const teacherMenuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Pano Özet", href: "/dashboard" },
    { icon: <Video className="w-5 h-5" />, label: "Ders Odaları", href: "/dashboard/rooms" },
    { icon: <Calendar className="w-5 h-5" />, label: "Ders Programı", href: "/dashboard/schedule" },
    { icon: <Users className="w-5 h-5" />, label: "Öğrenci & Veli", href: "/dashboard/students" },
    { icon: <CreditCard className="w-5 h-5" />, label: "Ödemeler", href: "/dashboard/payments" },
    { icon: <MessageCircle className="w-5 h-5" />, label: "Mesajlar", href: "/dashboard/messages" },
    { icon: <Settings className="w-5 h-5" />, label: "Ayarlar", href: "/dashboard/settings" },
  ];

  const studentMenuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Öğrenci Panosu", href: "/dashboard" },
    { icon: <Video className="w-5 h-5" />, label: "Derslerim", href: "/dashboard/rooms" },
    { icon: <Calendar className="w-5 h-5" />, label: "Programım", href: "/dashboard/schedule" },
    { icon: <Users className="w-5 h-5" />, label: "Arkadaşlarım", href: "/dashboard/students" },
    { icon: <MessageCircle className="w-5 h-5" />, label: "Öğretmenler", href: "/dashboard/messages" },
    { icon: <Settings className="w-5 h-5" />, label: "Ayarlar", href: "/dashboard/settings" },
  ];

  const parentMenuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Veli Panosu", href: "/dashboard" },
    { icon: <Calendar className="w-5 h-5" />, label: "Çocuğumun Programı", href: "/dashboard/schedule" },
    { icon: <CreditCard className="w-5 h-5" />, label: "Ödemelerim / Faturalar", href: "/dashboard/payments" },
    { icon: <MessageCircle className="w-5 h-5" />, label: "Öğretmenle İletişim", href: "/dashboard/messages" },
    { icon: <Settings className="w-5 h-5" />, label: "Ayarlar", href: "/dashboard/settings" },
  ];

  const menuItems =
    userRole === "student"
      ? studentMenuItems
      : userRole === "parent"
        ? parentMenuItems
        : teacherMenuItems;

  const roleLabel = userRole === "student" ? "ÖĞRENCİ" : userRole === "parent" ? "VELİ" : "ÖĞRETMEN";

  const handleLogout = async () => {
    await logoutClient();
    router.push("/login");
  };

  const updateStatus = (s: StatusValue) => {
    setStatus(s);
    setShowStatusMenu(false);
    try {
      localStorage.setItem(STATUS_KEY, s);
    } catch {
      /* ignore */
    }
  };

  const isMessagesPage = pathname?.startsWith("/dashboard/messages") ?? false;
  const displayName = fullName || (hydrated ? "Kullanıcı" : "");
  const displayInitial = initials || displayName.charAt(0) || "?";

  const renderSidebarBody = (onNavigate?: () => void) => (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
        <Link
          prefetch={false}
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2 text-xl font-bold text-primary-600"
        >
          <BookOpen className="w-6 h-6" /> Akademi Pro
        </Link>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="p-2 -mr-2 text-slate-500 hover:text-slate-800 md:hidden"
            aria-label="Menüyü kapat"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              prefetch={false}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium group ${
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-primary-50 hover:text-primary-600"
              }`}
            >
              <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold overflow-hidden">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              displayInitial
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">
              {displayName || (hydrated ? "Kullanıcı" : "...")}
            </p>
            <p className="text-xs text-slate-500 uppercase">{roleLabel}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200 flex flex-col shadow-xl animate-in slide-in-from-left">
            {renderSidebarBody(() => setMobileNavOpen(false))}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden md:flex fixed h-full z-40">
        {renderSidebarBody()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen w-full md:w-[calc(100%-16rem)]">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:text-primary-600 hover:bg-slate-100 rounded-lg"
              aria-label="Menüyü aç"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link
              prefetch={false}
              href="/dashboard"
              className="md:hidden flex items-center gap-2 text-lg font-bold text-primary-600"
            >
              <BookOpen className="w-5 h-5" /> EduCoach
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative" ref={notifBtnRef}>
              <button
                type="button"
                onClick={() => {
                  setShowNotifMenu((v) => !v);
                  setShowStatusMenu(false);
                }}
                className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-100 rounded-full transition-colors relative"
                aria-label="Bildirimler"
                aria-expanded={showNotifMenu}
              >
                <Bell className="w-6 h-6" />
                {hydrated && unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-[min(20rem,90vw)] bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">
                      Bildirimler{unreadCount > 0 ? ` (${unreadCount})` : ""}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          markAllNotificationsRead();
                          refreshNotifications();
                        }}
                        disabled={unreadCount === 0}
                        title="Tümünü okundu işaretle"
                        className="p-1 text-slate-400 hover:text-primary-600 disabled:opacity-40 disabled:hover:text-slate-400"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          clearAllNotifications();
                          refreshNotifications();
                        }}
                        disabled={notifications.length === 0}
                        title="Hepsini temizle"
                        className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-40 disabled:hover:text-slate-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                      <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      Henüz bildirim yok.
                    </div>
                  ) : (
                    <ul className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                      {notifications.slice(0, 20).map((n) => {
                        const Item: React.ElementType = n.href ? Link : "div";
                        const itemProps: Record<string, unknown> = n.href
                          ? { href: n.href, prefetch: false }
                          : {};
                        return (
                          <li key={n.id}>
                            <Item
                              {...itemProps}
                              onClick={() => {
                                markNotificationRead(n.id);
                                refreshNotifications();
                                if (n.href) setShowNotifMenu(false);
                              }}
                              className={`block px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                                !n.readAt ? "bg-primary-50/40" : ""
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {!n.readAt && (
                                  <span className="mt-1.5 w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                                  <p className="text-xs text-slate-500 line-clamp-2">{n.body}</p>
                                  <p className="text-[10px] text-slate-400 mt-1">{formatRelative(n.createdAt)}</p>
                                </div>
                              </div>
                            </Item>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
                    <Link
                      prefetch={false}
                      href="/dashboard/settings"
                      onClick={() => setShowNotifMenu(false)}
                      className="text-xs font-bold text-primary-600 hover:text-primary-700"
                    >
                      Bildirim ayarlarını yönet →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="relative hidden sm:block" ref={statusBtnRef}>
              <button
                type="button"
                onClick={() => {
                  setShowStatusMenu((v) => !v);
                  setShowNotifMenu(false);
                }}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors"
                aria-haspopup="menu"
                aria-expanded={showStatusMenu}
              >
                <span className={`w-2 h-2 rounded-full ${statusColor(status)}`} /> {status}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showStatusMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(s)}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                        status === s ? "bg-primary-50 text-primary-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusColor(s)}`} /> {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-x-hidden">{children}</div>
      </main>

      {/* Floating Chat Button — sadece mesajlar dışındaki sayfalarda */}
      {!isMessagesPage && (
        <Link
          prefetch={false}
          href="/dashboard/messages"
          className="fixed bottom-32 right-6 sm:bottom-36 sm:right-10 w-14 h-14 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group ring-4 ring-white/50 backdrop-blur-sm"
          aria-label="Mesajları aç"
        >
          <MessageCircle className="w-7 h-7" />
          <div className="absolute right-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-slate-700">
            Mesajları Aç
          </div>
        </Link>
      )}
    </div>
  );
}
