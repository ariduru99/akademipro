"use client";

import { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Filter, ChevronLeft, ChevronRight, Video, Trash2, Edit, X } from 'lucide-react';
import {
  type ScheduleEvent,
  addDaysISO,
  formatWeekRangeTR,
  isoDateOf,
  mondayOfWeek,
  todayISODate,
  todayScheduleDay,
} from '@/lib/scheduleSync';
import { sendNotification } from '@/lib/notifications';

export default function SchedulePage() {
  const [view, setView] = useState<'haftalik' | 'arsiv'>('haftalik');

  // Extend hours up to 23:00 for evening classes
  const hours = Array.from({ length: 15 }, (_, i) => `${i + 9}:00`);
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  const initialSchedule: ScheduleEvent[] = [
    { id: 1, day: 0, hour: 10, duration: 1.5, title: 'LGS Matematik Grubu', type: 'class', color: 'primary' },
    { id: 2, day: 2, hour: 14, duration: 1, title: 'İngilizce A2 (Zeynep)', type: 'class', color: 'yellow' },
    { id: 3, day: 4, hour: 16, duration: 2, title: 'YKS Fizik Hızlandırma', type: 'class', color: 'purple' },
    { id: 4, day: 1, hour: 19, duration: 1, title: 'Akşam Etüdü (Ali)', type: 'class', color: 'blue' },
    { id: 5, day: 3, hour: 12, duration: 1, title: 'Doktor Randevusu', type: 'personal', color: 'slate' },
  ];

  const [schedule, setSchedule] = useState<ScheduleEvent[]>(initialSchedule);
  const [isLoaded, setIsLoaded] = useState(false);

  const [weekStartIso, setWeekStartIso] = useState<string>(() =>
    isoDateOf(mondayOfWeek(new Date()))
  );

  const dayDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysISO(weekStartIso, i)),
    [weekStartIso]
  );

  const todayIso = useMemo(() => todayISODate(), []);
  const currentWeekStartIso = useMemo(
    () => isoDateOf(mondayOfWeek(new Date())),
    []
  );
  const isCurrentWeek = weekStartIso === currentWeekStartIso;
  const todayDayIndex = useMemo(() => todayScheduleDay(), []);

  const goPrevWeek = () => setWeekStartIso(addDaysISO(weekStartIso, -7));
  const goNextWeek = () => setWeekStartIso(addDaysISO(weekStartIso, 7));
  const goThisWeek = () => setWeekStartIso(currentWeekStartIso);

  const formatLongDate = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  const formatShortDate = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });

  // Load/Save from LocalStorage to persist
  useEffect(() => {
    try {
      const saved = localStorage.getItem('schedule_data');
      if (saved) setSchedule(JSON.parse(saved));
    } catch (e) {
      console.error("Error loading schedule data", e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('schedule_data', JSON.stringify(schedule));
    }
  }, [schedule, isLoaded]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; hour: number; date: string; id?: number } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filter, setFilter] = useState<{ class: boolean; personal: boolean }>({ class: true, personal: true });

  const [newEvent, setNewEvent] = useState({ title: '', type: 'class', duration: 1, color: 'primary' });

  const findEventForCell = (dayIndex: number, hourNum: number): ScheduleEvent | undefined => {
    const dayIso = dayDates[dayIndex];
    const dated = schedule.find(s => s.hour === hourNum && s.date === dayIso);
    if (dated) {
      if (dated.type === 'personal' && !filter.personal) return undefined;
      if (dated.type !== 'personal' && !filter.class) return undefined;
      return dated;
    }
    const weekly = schedule.find(s => s.hour === hourNum && !s.date && s.day === dayIndex);
    if (!weekly) return undefined;
    if (weekly.type === 'personal' && !filter.personal) return undefined;
    if (weekly.type !== 'personal' && !filter.class) return undefined;
    return weekly;
  };

  const filterActive = !filter.class || !filter.personal;

  const handleSlotClick = (dayIndex: number, hourStr: string) => {
    const hourNum = parseInt(hourStr.split(':')[0]);
    const dayIso = dayDates[dayIndex];
    const existingEvent = findEventForCell(dayIndex, hourNum);

    if (existingEvent) {
      setSelectedSlot({ day: dayIndex, hour: hourNum, date: dayIso, id: existingEvent.id });
      setNewEvent({
        title: existingEvent.title,
        type: existingEvent.type,
        duration: existingEvent.duration,
        color: existingEvent.color,
      });
      setIsEditMode(true);
    } else {
      setSelectedSlot({ day: dayIndex, hour: hourNum, date: dayIso });
      setNewEvent({ title: '', type: 'class', duration: 1, color: 'primary' });
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlot && newEvent.title) {
      const dayName = days[selectedSlot.day];
      const dateLabel = formatLongDate(selectedSlot.date);
      const timeLabel = `${selectedSlot.hour}:00`;
      if (isEditMode && selectedSlot.id) {
        setSchedule(
          schedule.map(s =>
            s.id === selectedSlot.id
              ? { ...s, ...newEvent, day: selectedSlot.day, hour: selectedSlot.hour, date: selectedSlot.date }
              : s
          )
        );
        void sendNotification({
          title: 'Takvim güncellendi',
          body: `${newEvent.title} · ${dayName}, ${dateLabel} ${timeLabel}`,
          kind: 'lesson',
          href: '/dashboard/schedule',
          channels: ['app'],
        });
      } else {
        setSchedule([
          ...schedule,
          {
            id: Date.now(),
            day: selectedSlot.day,
            hour: selectedSlot.hour,
            date: selectedSlot.date,
            ...newEvent,
          },
        ]);
        void sendNotification({
          title: 'Yeni randevu eklendi',
          body: `${newEvent.title} · ${dayName}, ${dateLabel} ${timeLabel}`,
          kind: 'lesson',
          href: '/dashboard/schedule',
        });
      }
      setIsModalOpen(false);
    }
  };

  const handleDeleteEvent = () => {
    if (selectedSlot && selectedSlot.id) {
      const removed = schedule.find(s => s.id === selectedSlot.id);
      setSchedule(schedule.filter(s => s.id !== selectedSlot.id));
      setIsModalOpen(false);
      if (removed) {
        void sendNotification({
          title: 'Randevu silindi',
          body: `${removed.title} kaldırıldı.`,
          kind: 'lesson',
          channels: ['app'],
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ders Programı</h2>
          <p className="text-slate-500 text-sm mt-1">Haftalık ders planınızı ve özel randevularınızı yönetin.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setView('haftalik')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'haftalik' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Haftalık Görünüm
          </button>
          <button onClick={() => setView('arsiv')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'arsiv' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Geçmiş Arşivi
          </button>
        </div>
      </div>

      {view === 'haftalik' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                <button
                  type="button"
                  onClick={goPrevWeek}
                  aria-label="Önceki hafta"
                  className="p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-slate-700 px-2">{formatWeekRangeTR(weekStartIso)}</span>
                <button
                  type="button"
                  onClick={goNextWeek}
                  aria-label="Sonraki hafta"
                  className="p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={goThisWeek}
                disabled={isCurrentWeek}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                  isCurrentWeek
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-default'
                    : 'bg-white border-slate-200 text-primary-600 hover:bg-primary-50'
                }`}
              >
                Bu Hafta
              </button>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen((v) => !v)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors bg-white shadow-sm"
              >
                <Filter className="w-4 h-4" /> Filtrele
                {filterActive && <span className="w-2 h-2 rounded-full bg-primary-500" />}
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Görünüm</p>
                  <label className="flex items-center justify-between py-2 cursor-pointer text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-500" /> Dersler
                    </span>
                    <input
                      type="checkbox"
                      checked={filter.class}
                      onChange={(e) => setFilter({ ...filter, class: e.target.checked })}
                      className="w-4 h-4 text-primary-600"
                    />
                  </label>
                  <label className="flex items-center justify-between py-2 cursor-pointer text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400" /> Özel işler
                    </span>
                    <input
                      type="checkbox"
                      checked={filter.personal}
                      onChange={(e) => setFilter({ ...filter, personal: e.target.checked })}
                      className="w-4 h-4 text-primary-600"
                    />
                  </label>
                  <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setFilter({ class: true, personal: true })}
                      className="text-xs text-slate-500 hover:text-primary-600"
                    >
                      Sıfırla
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      className="text-xs font-bold text-primary-600 hover:text-primary-700"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 border-b border-slate-200">
                <div className="p-3 text-center text-xs font-bold text-slate-400 bg-slate-50 border-r border-slate-200">SAAT</div>
                {days.map((day, i) => {
                  const isToday = isCurrentWeek && i === todayDayIndex;
                  return (
                    <div
                      key={day}
                      className={`p-3 text-center text-sm font-bold border-r border-slate-200 ${
                        isToday ? 'bg-primary-50 text-primary-700' : 'text-slate-600'
                      }`}
                    >
                      {day}
                      <div
                        className={`text-[10px] font-medium mt-0.5 ${
                          isToday ? 'text-primary-500' : 'text-slate-400'
                        }`}
                      >
                        {isToday ? 'Bugün' : formatShortDate(dayDates[i])}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="relative bg-slate-50">
                {hours.map((hour) => {
                  const hourNum = parseInt(hour.split(':')[0]);
                  return (
                    <div key={hour} className="grid grid-cols-8 border-b border-slate-100 h-20 group">
                      <div className="p-2 text-center text-xs font-medium text-slate-400 border-r border-slate-200 flex items-center justify-center bg-white">
                        {hour}
                      </div>
                      
                      {days.map((day, dayIndex) => {
                        const event = findEventForCell(dayIndex, hourNum);
                        return (
                          <div 
                            key={`${dayIndex}-${hour}`} 
                            onClick={() => handleSlotClick(dayIndex, hour)}
                            className="border-r border-slate-100 relative cursor-pointer hover:bg-primary-50/50 transition-colors p-1"
                          >
                            {event ? (
                              <div className={`absolute top-1 left-1 right-1 bg-${event.color}-100 border border-${event.color}-200 p-1.5 rounded-lg shadow-sm z-10 hover:shadow-md transition-shadow overflow-hidden`} style={{ height: `calc(${event.duration * 5}rem - 0.5rem)` }}>
                                <div className="flex flex-col h-full justify-between">
                                  <div className="flex items-start justify-between gap-1">
                                    <p className={`text-[10px] font-bold text-${event.color}-700 line-clamp-3 leading-tight break-words`}>{event.title}</p>
                                    {event.type === 'class' && <Video className={`w-2.5 h-2.5 text-${event.color}-500 shrink-0 mt-0.5`} />}
                                  </div>
                                  <p className={`text-[9px] text-${event.color}-600 mt-auto flex items-center gap-1 opacity-80`}>
                                    <Clock className="w-2.5 h-2.5" /> {hourNum}:00
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                <Plus className="w-5 h-5 text-slate-300" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
          <CalendarIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Geçmiş Arşivi</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">Önceki haftalara ait ders kayıtlarınız, iptal edilen dersleriniz ve notlarınız burada arşivlenir.</p>
          <div className="space-y-3 max-w-lg mx-auto text-left">
            {[1,2,3].map(i => (
              <div key={i} className="p-4 border border-slate-200 rounded-lg flex justify-between items-center hover:bg-slate-50 cursor-pointer">
                <div>
                  <h4 className="font-bold text-slate-700">Mayıs 1. Hafta (1-7 Mayıs)</h4>
                  <p className="text-sm text-slate-500">14 Tamamlanan Ders • 2 İptal</p>
                </div>
                <button className="text-primary-600 text-sm font-bold">Görüntüle</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {isModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">
                {isEditMode ? 'Dersi / Etkinliği Düzenle' : 'Yeni Ders / Etkinlik Ekle'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
              <div className="flex gap-4 mb-2">
                <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">TARİH</p>
                  <p className="font-medium text-slate-800">{days[selectedSlot.day]}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatLongDate(selectedSlot.date)}</p>
                </div>
                <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">BAŞLANGIÇ</p>
                  <p className="font-medium text-slate-800">{selectedSlot.hour}:00</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Etkinlik Türü</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setNewEvent({...newEvent, type: 'class', color: 'primary'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${newEvent.type === 'class' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Ders</button>
                  <button type="button" onClick={() => setNewEvent({...newEvent, type: 'personal', color: 'slate'})} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${newEvent.type === 'personal' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Özel İş</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Başlık / Öğrenci Adı</label>
                <input required type="text" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} placeholder="Örn: Ayşe Hanım İngilizce Dersi" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Süre (Saat)</label>
                <select value={newEvent.duration} onChange={(e) => setNewEvent({...newEvent, duration: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value={1}>1 Saat</option>
                  <option value={1.5}>1.5 Saat</option>
                  <option value={2}>2 Saat</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                {isEditMode && (
                  <button type="button" onClick={handleDeleteEvent} className="flex items-center justify-center px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-bold">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button type="submit" className="flex-1 bg-primary-600 text-white font-medium py-2.5 rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
                  {isEditMode ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
