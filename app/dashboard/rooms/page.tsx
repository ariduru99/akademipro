"use client";

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Users, Video, Clock, MoreVertical, X, Lock, Edit, Trash2, CheckCircle2, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import {
  type ScheduleEvent,
  formatRoomTimeLabel,
  formatScheduleEventLabel,
  scheduleTitleForRoomCard,
  upsertScheduleFromRoom,
  removeScheduleEventById,
  todayISODate,
} from '@/lib/scheduleSync';
import { sendNotification } from '@/lib/notifications';

type Room = {
  id: string;
  name: string;
  students: number;
  time: string;
  status: string;
  color: string;
  scheduleDate?: string;
  startTime?: string;
  endTime?: string;
  scheduleEventId?: number;
};

export default function RoomsPage() {
  const defaultRooms: Room[] = [];

  const [rooms, setRooms] = useState(defaultRooms);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadScheduleFromStorage = () => {
    try {
      const raw = localStorage.getItem('schedule_data');
      if (!raw) {
        setScheduleEvents([]);
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      setScheduleEvents(Array.isArray(parsed) ? parsed : []);
    } catch {
      setScheduleEvents([]);
    }
  };

  useEffect(() => {
    try {
      const savedRooms = localStorage.getItem('rooms_data');
      if (savedRooms) setRooms(JSON.parse(savedRooms));
    } catch (e) {
      console.error("Error loading rooms data", e);
    }
    loadScheduleFromStorage();
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const refresh = () => loadScheduleFromStorage();
    const onVis = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', refresh);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('rooms_data', JSON.stringify(rooms));
    }
  }, [rooms, isLoaded]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRoomId, setEditRoomId] = useState<string | null>(null);
  const [newRoom, setNewRoom] = useState({
    name: '',
    scheduleDate: todayISODate(),
    startTime: '14:00',
    endTime: '15:00',
    isPrivate: true,
    password: '',
  });
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const generateCode = () => 'RM-' + Math.random().toString(36).substring(2, 6).toUpperCase();

  const roomTimeDisplay = (r: Room) => {
    if (r.scheduleDate && r.startTime && r.endTime) {
      return formatRoomTimeLabel(r.scheduleDate, r.startTime, r.endTime);
    }
    return r.time;
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, scheduleDate, startTime, endTime, isPrivate, password } = newRoom;
    if (!name.trim()) return;
    if (!scheduleDate || !startTime || !endTime) {
      showToast('Tarih ile başlangıç / bitiş saatini seçin.');
      return;
    }
    if (!editRoomId && isPrivate && !password.trim()) {
      showToast('Şifreli oda için şifre girin.');
      return;
    }

    const displayTime = formatRoomTimeLabel(scheduleDate, startTime, endTime);

    const existing = editRoomId ? rooms.find((r) => r.id === editRoomId) : null;
    const eventId = upsertScheduleFromRoom({
      scheduleEventId: existing?.scheduleEventId,
      roomName: name.trim(),
      isoDate: scheduleDate,
      startTime,
      endTime,
      color: existing?.color || 'primary',
    });

    if (editRoomId) {
      setRooms(
        rooms.map((r) =>
          r.id === editRoomId
            ? {
                ...r,
                name: name.trim(),
                time: displayTime,
                scheduleDate,
                startTime,
                endTime,
                scheduleEventId: eventId,
              }
            : r
        )
      );
      setEditRoomId(null);
      loadScheduleFromStorage();
      showToast('Oda güncellendi; ders programına yansıtıldı.');
      void sendNotification({
        title: 'Oda güncellendi',
        body: `${name.trim()} odası yeni bilgilerle kaydedildi (${displayTime}).`,
        kind: 'lesson',
        href: '/dashboard/rooms',
      });
    } else {
      setRooms([
        {
          id: generateCode(),
          name: name.trim(),
          students: 0,
          time: displayTime,
          status: 'active',
          color: 'primary',
          scheduleDate,
          startTime,
          endTime,
          scheduleEventId: eventId,
        },
        ...rooms,
      ]);
      loadScheduleFromStorage();
      showToast('Oda oluşturuldu ve takvime eklendi.');
      void sendNotification({
        title: 'Yeni ders odası oluşturuldu',
        body: `${name.trim()} · ${displayTime}. Takvime eklendi.`,
        kind: 'lesson',
        href: '/dashboard/rooms',
      });
    }
    setIsModalOpen(false);
    setNewRoom({
      name: '',
      scheduleDate: todayISODate(),
      startTime: '14:00',
      endTime: '15:00',
      isPrivate: true,
      password: '',
    });
  };

  const handleEditRoom = (room: Room) => {
    setEditRoomId(room.id);
    setNewRoom({
      name: room.name,
      scheduleDate: room.scheduleDate || todayISODate(),
      startTime: room.startTime || '14:00',
      endTime: room.endTime || '15:00',
      isPrivate: true,
      password: '',
    });
    setActiveMenuId(null);
    setIsModalOpen(true);
  };

  const handleDeleteRoom = (id: string) => {
    const r = rooms.find((x) => x.id === id);
    if (r?.scheduleEventId) removeScheduleEventById(r.scheduleEventId);
    setRooms(rooms.filter((x) => x.id !== id));
    setActiveMenuId(null);
    showToast('Oda silindi.');
    loadScheduleFromStorage();
    if (r) {
      void sendNotification({
        title: 'Ders odası silindi',
        body: `${r.name} odası kapatıldı ve takvimden kaldırıldı.`,
        kind: 'lesson',
        channels: ['app'],
      });
    }
  };

  const scheduleClassesForRooms = useMemo(() => {
    const linkedIds = new Set(
      rooms.map((r) => r.scheduleEventId).filter((x): x is number => typeof x === 'number')
    );
    return scheduleEvents.filter(
      (ev) => ev.type !== 'personal' && !linkedIds.has(ev.id)
    );
  }, [rooms, scheduleEvents]);

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr');
    return rooms.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = `${r.name} ${r.id} ${r.time}`.toLocaleLowerCase('tr');
      return haystack.includes(q);
    });
  }, [rooms, search, statusFilter]);

  const filteredScheduleClasses = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr');
    if (!q && statusFilter === 'all') return scheduleClassesForRooms;
    if (statusFilter !== 'all') return [];
    return scheduleClassesForRooms.filter((ev) => {
      const text = `${ev.title} SC-${ev.id}`.toLocaleLowerCase('tr');
      return text.includes(q);
    });
  }, [scheduleClassesForRooms, search, statusFilter]);

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="fixed top-20 right-8 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-right-8 z-50">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ders Odaları</h2>
          <p className="text-slate-500 text-sm mt-1">
            Ders programınızdaki dersler (özel iş hariç) burada listelenir; sanal oda da oluşturabilirsiniz.
          </p>
        </div>
        <button
          onClick={() => {
            setEditRoomId(null);
            setNewRoom({
              name: '',
              scheduleDate: todayISODate(),
              startTime: '14:00',
              endTime: '15:00',
              isPrivate: true,
              password: '',
            });
            setIsModalOpen(true);
          }}
          className="btn btn-primary flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Yeni Oda Oluştur
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Oda adı, kodu veya saat ile ara..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="upcoming">Yaklaşan</option>
            <option value="completed">Tamamlanan</option>
          </select>
        </div>
      </div>

      {filteredRooms.length === 0 && filteredScheduleClasses.length === 0 && (
        <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-sm text-slate-500">
          Aramanıza uygun oda bulunamadı.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className={`h-2 bg-${room.color}-500`} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${room.color}-100 text-${room.color}-600 flex items-center justify-center font-bold text-xl`}>
                  {room.name.charAt(0)}
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === room.id ? null : room.id)} 
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {activeMenuId === room.id && (
                    <div className="absolute right-0 top-8 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 animate-in fade-in zoom-in-95">
                      <button onClick={() => handleEditRoom(room)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <Edit className="w-4 h-4 text-slate-400"/> Düzenle
                      </button>
                      <div className="h-px bg-slate-100"></div>
                      <button onClick={() => handleDeleteRoom(room.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-red-400"/> Sil
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-primary-600 transition-colors">{room.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-sm font-bold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">{room.id}</p>
                <Lock className="w-3 h-3 text-slate-400" />
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{room.students} Öğrenci</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{roomTimeDisplay(room)}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-auto">
                <Link prefetch={false} href={`/dashboard/rooms/${room.id}`} className="flex-1 bg-primary-50 hover:bg-primary-100 text-primary-700 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                  <Video className="w-4 h-4" /> Katıl
                </Link>
                <button onClick={() => handleEditRoom(room)} className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Detaylar
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredScheduleClasses.map((ev) => {
          const joinId = `SC-${ev.id}`;
          const menuKey = `sched-${ev.id}`;
          const title = scheduleTitleForRoomCard(ev.title);
          return (
            <div key={joinId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className={`h-2 bg-${ev.color}-500`} />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-${ev.color}-100 text-${ev.color}-600 flex items-center justify-center font-bold text-xl`}>
                    {title.charAt(0)}
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === menuKey ? null : menuKey)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {activeMenuId === menuKey && (
                      <div className="absolute right-0 top-8 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 animate-in fade-in zoom-in-95">
                        <Link
                          prefetch={false}
                          href="/dashboard/schedule"
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          onClick={() => setActiveMenuId(null)}
                        >
                          <CalendarDays className="w-4 h-4 text-slate-400" /> Programda düzenle
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                    Ders programı
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-primary-600 transition-colors">{title}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-sm font-bold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">{joinId}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Program kaydı</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{formatScheduleEventLabel(ev)}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <Link
                    prefetch={false}
                    href={`/dashboard/rooms/${joinId}`}
                    className="flex-1 bg-primary-50 hover:bg-primary-100 text-primary-700 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" /> Katıl
                  </Link>
                  <Link
                    prefetch={false}
                    href="/dashboard/schedule"
                    className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center"
                  >
                    Program
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Video className="w-5 h-5 text-primary-600" /> {editRoomId ? 'Oda Bilgilerini Düzenle' : 'Yeni Sanal Oda Oluştur'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditRoomId(null);
                  setNewRoom({
                    name: '',
                    scheduleDate: todayISODate(),
                    startTime: '14:00',
                    endTime: '15:00',
                    isPrivate: true,
                    password: '',
                  });
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ders/Oda Adı</label>
                <input
                  required
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="Örn: 8A Fen Bilimleri"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary-600" />
                  Tarih ve saat (ders programına otomatik eklenir)
                </label>
                <input
                  type="date"
                  required
                  value={newRoom.scheduleDate}
                  onChange={(e) => setNewRoom({ ...newRoom, scheduleDate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Başlangıç</label>
                    <input
                      type="time"
                      required
                      step={300}
                      value={newRoom.startTime}
                      onChange={(e) => setNewRoom({ ...newRoom, startTime: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Bitiş</label>
                    <input
                      type="time"
                      required
                      step={300}
                      value={newRoom.endTime}
                      onChange={(e) => setNewRoom({ ...newRoom, endTime: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Kaydettiğinizde aynı saat aralığı <strong>Ders Programı</strong> haftalık görünümüne eklenir (oda adı ile).
                </p>
              </div>

              {!editRoomId && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-700 text-sm">Şifreli Giriş (Güvenlik)</h4>
                      <p className="text-xs text-slate-500">Sadece şifreyi bilen öğrenciler katılabilir.</p>
                    </div>
                    <input type="checkbox" checked={newRoom.isPrivate} onChange={(e) => setNewRoom({...newRoom, isPrivate: e.target.checked})} className="w-4 h-4 text-primary-600" />
                  </div>
                  {newRoom.isPrivate && (
                    <div>
                      <input
                        required={!editRoomId && newRoom.isPrivate}
                        type="text"
                        value={newRoom.password}
                        onChange={(e) => setNewRoom({ ...newRoom, password: e.target.value })}
                        placeholder="Oda şifresi belirleyin..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                  )}
                </div>
              )}

              <button type="submit" className="w-full bg-primary-600 text-white font-medium py-2.5 rounded-lg hover:bg-primary-700 transition-colors shadow-sm mt-4">
                {editRoomId ? 'Güncelle' : 'Odayı Oluştur'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
