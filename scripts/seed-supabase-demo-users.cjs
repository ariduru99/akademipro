/**
 * Mock seed kullanıcılarını Supabase'e aktarır (auth + profiles tetikleyicisi + family_relations).
 *
 * Önkoşullar:
 * - supabase/schema.sql ve migrations (özellikle handle_new_user tetikleyicisi) uygulanmış olmalı
 * - .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY (anon key bu betik için şart değil)
 *
 * Çalıştırma: npm run seed:demo
 *
 * Tekrar çalıştırma: E-posta zaten kayıtlıysa mevcut kullanıcı ID'si bulunur; ilişki satırı eklenmeye çalışılır.
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvLocal();

function supabaseUrlAndServiceKey() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  } catch {
    return null;
  }
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

async function ensureUser(admin, { email, password, user_metadata }) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata,
  });
  if (!error && data.user) return data.user.id;

  const msg = (error && error.message) || "";
  if (/already|registered|exists/i.test(msg)) {
    const { data: listData, error: listErr } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) throw listErr;
    const found = listData.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
    if (found) return found.id;
  }
  throw error || new Error(`Kullanıcı oluşturulamadı: ${email}`);
}

async function ensureFamilyRelation(admin, parentId, studentId) {
  const { error } = await admin.from("family_relations").insert({
    parent_id: parentId,
    student_id: studentId,
  });
  if (error && !/duplicate|unique/i.test(error.message)) throw error;
}

async function main() {
  const cfg = supabaseUrlAndServiceKey();
  if (!cfg) {
    console.error(
      "Eksik ortam: geçerli NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli (.env.local)."
    );
    process.exit(1);
  }

  const admin = createClient(cfg.url, cfg.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const teacherId = await ensureUser(admin, {
    email: "tugba@demo.com",
    password: "password123",
    user_metadata: {
      role: "teacher",
      full_name: "Tuğba Öğretmen",
      city: "İstanbul",
    },
  });

  await admin.from("profiles").update({ hourly_rate: 600 }).eq("id", teacherId);

  const parentId = await ensureUser(admin, {
    email: "veli@demo.com",
    password: "password123",
    user_metadata: {
      role: "parent",
      full_name: "Ahmet Yılmaz (Veli)",
      city: "Ankara",
    },
  });

  const studentId = await ensureUser(admin, {
    email: "ogrenci@demo.com",
    password: "password123",
    user_metadata: {
      role: "student",
      full_name: "Can Yılmaz (Öğrenci)",
      city: "Ankara",
    },
  });

  await ensureFamilyRelation(admin, parentId, studentId);

  console.log("Demo kullanıcılar hazır:");
  console.log("  Öğretmen: tugba@demo.com / password123");
  console.log("  Veli:     veli@demo.com / password123");
  console.log("  Öğrenci:  ogrenci@demo.com / password123");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
