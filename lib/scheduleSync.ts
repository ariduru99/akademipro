/** Haftalık program: 0 = Pazartesi … 6 = Pazar */
export const WEEKDAYS_TR = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
] as const;

export type ScheduleEvent = {
  id: number;
  day: number;
  hour: number;
  duration: number;
  title: string;
  type: string;
  color: string;
  /** ISO yyyy-mm-dd. Belirtilmişse etkinlik o tarihe bağlıdır; boşsa eski "her hafta" davranışı sürer. */
  date?: string;
};

/** yyyy-mm-dd → program gün indeksi (Pzt=0) */
export function dateStrToScheduleDay(isoDate: string): number {
  const d = new Date(`${isoDate}T12:00:00`);
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}

export function formatRoomTimeLabel(isoDate: string, start: string, end: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  const gun = WEEKDAYS_TR[dateStrToScheduleDay(isoDate)];
  const tarih = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  return `${gun}, ${tarih} · ${start} – ${end}`;
}

function parseTimeToHourMinute(t: string): { h: number; m: number } {
  const [h, m] = t.split(":").map((x) => parseInt(x, 10) || 0);
  return { h, m };
}

/** Program ızgarası 9–23 saat; saat sütununa yuvarla */
export function startTimeToScheduleHour(start: string): number {
  const { h } = parseTimeToHourMinute(start);
  return Math.min(23, Math.max(9, h));
}

export function durationHours(start: string, end: string): number {
  const a = parseTimeToHourMinute(start);
  const b = parseTimeToHourMinute(end);
  const startMin = a.h * 60 + a.m;
  const endMin = b.h * 60 + b.m;
  let diff = (endMin - startMin) / 60;
  if (diff <= 0) diff = 1;
  return Math.min(4, Math.max(0.5, diff));
}

export function upsertScheduleInList(schedule: ScheduleEvent[], opts: {
  scheduleEventId?: number | null;
  roomName: string;
  isoDate: string;
  startTime: string;
  endTime: string;
  color: string;
}): { eventId: number; schedule: ScheduleEvent[] } {
  const nextSchedule = Array.isArray(schedule) ? [...schedule] : [];
  const day = dateStrToScheduleDay(opts.isoDate);
  const hour = startTimeToScheduleHour(opts.startTime);
  const duration = durationHours(opts.startTime, opts.endTime);
  const title = `${opts.roomName} (Ders Odası)`;
  const id = opts.scheduleEventId && opts.scheduleEventId > 0 ? opts.scheduleEventId : Date.now();

  const event: ScheduleEvent = {
    id,
    day,
    hour,
    duration,
    title,
    type: "class",
    color: opts.color || "primary",
    date: opts.isoDate,
  };

  const idx = nextSchedule.findIndex((s) => s.id === id);
  if (idx >= 0) nextSchedule[idx] = { ...nextSchedule[idx], ...event };
  else nextSchedule.push(event);

  return { eventId: id, schedule: nextSchedule };
}

export function removeScheduleEventFromList(schedule: ScheduleEvent[], eventId: number): ScheduleEvent[] {
  return (Array.isArray(schedule) ? schedule : []).filter((s) => s.id !== eventId);
}

export function isoDateOf(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISODate(): string {
  return isoDateOf(new Date());
}

/** Verilen tarihi içeren haftanın Pazartesi'sini döndürür */
export function mondayOfWeek(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const js = copy.getDay();
  const diff = js === 0 ? -6 : 1 - js;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

export function mondayISOForDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return isoDateOf(mondayOfWeek(d));
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return isoDateOf(d);
}

/** Verilen Pazartesi tarihinden başlayan hafta için "12 - 18 Mayıs 2026" gibi başlık üretir */
export function formatWeekRangeTR(mondayIso: string): string {
  const monday = new Date(`${mondayIso}T12:00:00`);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const sameMonth = monday.getMonth() === sunday.getMonth();
  const sameYear = monday.getFullYear() === sunday.getFullYear();
  const monthFmt = (d: Date) =>
    d.toLocaleDateString("tr-TR", { month: "long" });
  if (sameMonth && sameYear) {
    return `${monday.getDate()} - ${sunday.getDate()} ${monthFmt(monday)} ${monday.getFullYear()}`;
  }
  if (sameYear) {
    return `${monday.getDate()} ${monthFmt(monday)} - ${sunday.getDate()} ${monthFmt(sunday)} ${monday.getFullYear()}`;
  }
  return `${monday.getDate()} ${monthFmt(monday)} ${monday.getFullYear()} - ${sunday.getDate()} ${monthFmt(sunday)} ${sunday.getFullYear()}`;
}

/** Bugünün program günü indeksi (Pzt=0..Pzr=6) */
export function todayScheduleDay(): number {
  const js = new Date().getDay();
  return js === 0 ? 6 : js - 1;
}

/** Haftalık program satırı → okunur metin (tekrarlayan dersler) */
export function formatScheduleWeeklyLabel(e: ScheduleEvent): string {
  const gun = WEEKDAYS_TR[e.day];
  const pad = (n: number) => n.toString().padStart(2, "0");
  const endTotalMin = e.hour * 60 + e.duration * 60;
  const eh = Math.floor(endTotalMin / 60) % 24;
  const em = Math.floor(endTotalMin % 60);
  return `Her ${gun}, ${e.hour}:00 – ${eh}:${pad(em)}`;
}

/** Etkinlik tarihliyse gerçek tarihi gösterir, değilse haftalık tekrar metnine düşer */
export function formatScheduleEventLabel(e: ScheduleEvent): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const endTotalMin = e.hour * 60 + e.duration * 60;
  const eh = Math.floor(endTotalMin / 60) % 24;
  const em = Math.floor(endTotalMin % 60);
  const startStr = `${e.hour}:00`;
  const endStr = `${eh}:${pad(em)}`;
  if (e.date) return formatRoomTimeLabel(e.date, startStr, endStr);
  return formatScheduleWeeklyLabel(e);
}

/** Takvimdeki "X (Ders Odası)" başlığını kartta sade göstermek için */
export function scheduleTitleForRoomCard(title: string): string {
  return title.replace(/\s*\(Ders Odası\)\s*$/i, "").trim() || title;
}
