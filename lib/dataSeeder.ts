import { emitProfileChange } from "./profile";

/** 
 * Demo ortamında tüm modüllerin başlangıç verilerini localStorage'a yazar.
 * Eğer veri zaten varsa dokunmaz.
 */
export function seedDemoData() {
  if (typeof window === "undefined") return;

  const SEED_FLAG = "akademipro_seeded";
  if (localStorage.getItem(SEED_FLAG)) return;

  // 1. Students Data
  if (!localStorage.getItem("students_data")) {
    const defaultStudents = [
      { id: 1, name: "Ali Yılmaz", parent: "Ahmet Yılmaz", phone: "+905551234567", email: "ali@example.com", grade: "8. Sınıf", courses: ["Matematik", "Fen"], status: "active" },
      { id: 2, name: "Zeynep Kaya", parent: "Ayşe Kaya", phone: "+905559876543", email: "zeynep@example.com", grade: "12. Sınıf", courses: ["Fizik", "Geometri"], status: "active" },
      { id: 3, name: "Can Özkan", parent: "Mehmet Özkan", phone: "+905554567890", email: "can@example.com", grade: "7. Sınıf", courses: ["Matematik"], status: "inactive" },
      { id: 4, name: "Elif Çelik", parent: "Fatma Çelik", phone: "+905552223344", email: "elif@example.com", grade: "8. Sınıf", courses: ["Fen", "İngilizce"], status: "active" },
    ];
    localStorage.setItem("students_data", JSON.stringify(defaultStudents));
  }

  // 2. Payment Requests
  if (!localStorage.getItem("payment_requests")) {
    const defaultPayments = [
      { id: 1, student: "Ali Yılmaz", parent: "Ahmet Bey", desc: "Mayıs Ayı Matematik Dersleri (8 Seans)", amount: 4800, date: "1 Mayıs 2026", status: "pending" },
      { id: 2, student: "Zeynep Kaya", parent: "Ayşe Hanım", desc: "İngilizce A2 - 4 Ders", amount: 1800, date: "28 Nisan 2026", status: "paid" },
      { id: 3, student: "Elif Çelik", parent: "Fatma Hanım", desc: "Nisan Ayı Fen Bilimleri", amount: 2400, date: "15 Nisan 2026", status: "confirmed" },
    ];
    localStorage.setItem("payment_requests", JSON.stringify(defaultPayments));
  }

  // 3. Schedule Data
  if (!localStorage.getItem("schedule_data")) {
    const defaultSchedule = [
      { id: 1, day: 0, hour: 10, duration: 1.5, title: 'LGS Matematik Grubu', type: 'class', color: 'primary' },
      { id: 2, day: 2, hour: 14, duration: 1, title: 'İngilizce A2 (Zeynep)', type: 'class', color: 'yellow' },
      { id: 3, day: 4, hour: 16, duration: 2, title: 'YKS Fizik Hızlandırma', type: 'class', color: 'purple' },
      { id: 4, day: 1, hour: 19, duration: 1, title: 'Akşam Etüdü (Ali)', type: 'class', color: 'blue' },
      { id: 5, day: 3, hour: 12, duration: 1, title: 'Doktor Randevusu', type: 'personal', color: 'slate' },
    ];
    localStorage.setItem("schedule_data", JSON.stringify(defaultSchedule));
  }

  // 4. Rooms Data
  if (!localStorage.getItem("rooms_data")) {
    const defaultRooms = [
      { id: 'RM-984A', name: 'LGS Matematik Grubu', students: 5, time: 'Salı, 14:00 - 15:30', status: 'active', color: 'primary' },
      { id: 'RM-412X', name: 'İngilizce A2 Seviye', students: 1, time: 'Çarşamba, 16:00 - 17:00', status: 'upcoming', color: 'yellow' },
      { id: 'RM-105B', name: 'YKS Fizik Hızlandırma', students: 12, time: 'Cuma, 18:00 - 20:00', status: 'upcoming', color: 'purple' },
    ];
    localStorage.setItem("rooms_data", JSON.stringify(defaultRooms));
  }

  // 5. Default Profile/Settings for Demo
  if (!localStorage.getItem("app_settings")) {
    const defaultSettings = {
      fullName: "Tuğba Öğretmen",
      email: "tugba@demo.com",
      phone: "+90 555 123 4567",
      city: "İstanbul",
      notifEmail: true,
      notifSms: false,
      notifApp: true,
      reminderMinutes: 15,
      iban: "TR12 0006 2000 0001 2345 6789 01",
      bankName: "Demo Bank A.Ş.",
      accountHolder: "Tuğba Öğretmen",
      isFreelancer: true,
    };
    localStorage.setItem("app_settings", JSON.stringify(defaultSettings));
  }

  if (!localStorage.getItem("auth_session")) {
    const defaultSession = {
      id: "demo-teacher-1",
      role: "teacher",
      full_name: "Tuğba Öğretmen",
      email: "tugba@demo.com",
    };
    localStorage.setItem("auth_session", JSON.stringify(defaultSession));
  }

  localStorage.setItem(SEED_FLAG, "true");
  emitProfileChange();
}
