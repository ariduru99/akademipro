// Sanal (mock) veritabanı katmanı.
// Şu an localStorage tabanlı; ileride Supabase'e geçtiğimizde sadece bu modülün
// içi değişecek, çağrı yerleri aynı kalacak.

const USERS_KEY = "mock_users_v1";

export type MockUser = {
  id: string;
  role: "teacher" | "student" | "parent";
  profile_code: string;
  full_name: string;
  email: string;
  password: string;
  city?: string;
  hourly_rate?: number;
  linked_student_id?: string;
  linked_parent_id?: string;
  createdAt?: string;
  stats?: {
    today_classes: number;
    pending_homework: number;
    monthly_earnings: string;
    total_students: number;
  };
};

export const seedUsers: MockUser[] = [];

/** Geriye dönük uyumluluk: bazı sayfalar `mockUsers` adıyla import ediyor. */
export const mockUsers = seedUsers;

const isBrowser = () => typeof window !== "undefined";

function readStored(): MockUser[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as MockUser[]) : [];
  } catch {
    return [];
  }
}

function writeStored(users: MockUser[]) {
  if (!isBrowser()) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getAllUsers(): MockUser[] {
  const stored = readStored();
  const map = new Map<string, MockUser>();
  for (const u of seedUsers) map.set(u.email.toLowerCase(), u);
  for (const u of stored) map.set(u.email.toLowerCase(), u);
  return Array.from(map.values());
}

function genCode(prefix: string) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function genId() {
  return `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export type RegisterInput =
  | {
      type: "teacher";
      fullName: string;
      email: string;
      password: string;
      city?: string;
    }
  | {
      type: "student_parent";
      student: { fullName: string; email: string; password: string };
      parent: { fullName: string; email: string; password: string };
      city?: string;
    };

export type RegisterResult = {
  primary: MockUser;
  linked?: MockUser;
};

export async function mockRegister(input: RegisterInput): Promise<RegisterResult> {
  await new Promise((r) => setTimeout(r, 600));
  const all = getAllUsers();
  const exists = (email: string) =>
    all.some((u) => u.email.toLowerCase() === email.toLowerCase());

  if (input.type === "teacher") {
    const email = input.email.trim();
    if (!email || !input.password) throw new Error("E-posta ve şifre zorunlu.");
    if (input.password.length < 6) throw new Error("Şifre en az 6 karakter olmalı.");
    if (exists(email)) throw new Error("Bu e-posta zaten kayıtlı.");
    const user: MockUser = {
      id: genId(),
      role: "teacher",
      profile_code: genCode("TCH"),
      full_name: input.fullName.trim() || "Öğretmen",
      email,
      password: input.password,
      city: input.city || "",
      createdAt: new Date().toISOString(),
      stats: {
        today_classes: 0,
        pending_homework: 0,
        monthly_earnings: "0",
        total_students: 0,
      },
    };
    const stored = readStored();
    stored.push(user);
    writeStored(stored);
    return { primary: user };
  }

  const studentEmail = input.student.email.trim();
  const parentEmail = input.parent.email.trim();
  if (!studentEmail || !parentEmail || !input.student.password || !input.parent.password) {
    throw new Error("Tüm öğrenci ve veli bilgileri zorunlu.");
  }
  if (input.student.password.length < 6 || input.parent.password.length < 6) {
    throw new Error("Şifre en az 6 karakter olmalı.");
  }
  if (studentEmail.toLowerCase() === parentEmail.toLowerCase()) {
    throw new Error("Öğrenci ve veli e-postaları farklı olmalı.");
  }
  if (exists(studentEmail) || exists(parentEmail)) {
    throw new Error("Bu e-postalardan biri zaten kayıtlı.");
  }

  const studentId = genId();
  const parentId = genId();
  const now = new Date().toISOString();

  const studentUser: MockUser = {
    id: studentId,
    role: "student",
    profile_code: genCode("STD"),
    full_name: input.student.fullName.trim() || "Öğrenci",
    email: studentEmail,
    password: input.student.password,
    city: input.city || "",
    linked_parent_id: parentId,
    createdAt: now,
    stats: { today_classes: 0, pending_homework: 0, monthly_earnings: "0", total_students: 0 },
  };
  const parentUser: MockUser = {
    id: parentId,
    role: "parent",
    profile_code: genCode("PAR"),
    full_name: input.parent.fullName.trim() || "Veli",
    email: parentEmail,
    password: input.parent.password,
    city: input.city || "",
    linked_student_id: studentId,
    createdAt: now,
    stats: { today_classes: 0, pending_homework: 0, monthly_earnings: "0", total_students: 1 },
  };

  const stored = readStored();
  stored.push(studentUser, parentUser);
  writeStored(stored);
  return { primary: parentUser, linked: studentUser };
}

export async function mockLogin(identifier: string, pass: string): Promise<MockUser> {
  await new Promise((r) => setTimeout(r, 500));
  const id = identifier.trim();
  if (!id || !pass) throw new Error("E-posta/profil kodu ve şifre zorunlu.");
  const all = getAllUsers();
  const user = all.find(
    (u) =>
      (u.email.toLowerCase() === id.toLowerCase() ||
        u.profile_code.toLowerCase() === id.toLowerCase()) &&
      u.password === pass
  );
  if (!user) throw new Error("Hatalı e-posta/profil kodu veya şifre.");
  return user;
}

export async function mockResetPassword(identifier: string): Promise<{ ok: true; message: string }>
{
  await new Promise((r) => setTimeout(r, 500));
  const id = identifier.trim().toLowerCase();
  const all = getAllUsers();
  const user = all.find(
    (u) => u.email.toLowerCase() === id || u.profile_code.toLowerCase() === id
  );
  if (!user) throw new Error("Bu e-posta veya profil kodu bulunamadı.");
  return {
    ok: true,
    message:
      "Şifre sıfırlama bağlantısı gönderildi. Gerçek e-posta sağlayıcı yapılandırıldığında bu mesaj kullanıcının posta kutusuna düşecek.",
  };
}

export const mockRooms = [
  {
    id: "rm-1",
    teacher_id: "usr-1",
    room_code: "RM-984A",
    title: "LGS Matematik Grubu",
    subject: "Matematik",
    type: "Online",
    time: "14:00 - 15:30",
    students_count: 5,
    is_live: true,
    is_1on1: false,
  },
  {
    id: "rm-2",
    teacher_id: "usr-1",
    room_code: "RM-412X",
    title: "İngilizce A2 Seviye",
    subject: "İngilizce",
    type: "Yüz Yüze",
    time: "16:00 - 17:00",
    students_count: 1,
    is_live: false,
    is_1on1: true,
  },
];
