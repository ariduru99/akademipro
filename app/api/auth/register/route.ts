import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isSupabaseRegisterConfigured } from "@/lib/authEnv";
import { sendEmailViaResend, appendOutbox, getProvidersStatus } from "@/lib/notifyServer";

export const runtime = "nodejs";

type TeacherBody = {
  kind: "teacher";
  fullName: string;
  email: string;
  password: string;
  city?: string;
};

type StudentParentBody = {
  kind: "student_parent";
  city?: string;
  student: { fullName: string; email: string; password: string };
  parent: { fullName: string; email: string; password: string };
};

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function mapSupabaseAuthMessage(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Bu e-posta zaten kayıtlı.";
  if (m.includes("password")) return "Şifre kurallarına uymuyor (en az 6 karakter deneyin).";
  return msg || "Kayıt sırasında hata oluştu.";
}

export async function POST(req: Request) {
  if (!isSupabaseRegisterConfigured()) {
    return NextResponse.json(
      {
        error:
          "Supabase kayıt için NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.",
      },
      { status: 503 }
    );
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const kind = (body as { kind?: string }).kind;

  if (kind === "teacher") {
    const b = body as TeacherBody;
    const email = (b.email || "").trim();
    const password = b.password || "";
    const fullName = (b.fullName || "").trim() || "Öğretmen";
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Geçerli bir e-posta girin." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalı." }, { status: 400 });
    }

    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "teacher",
        full_name: fullName,
        city: (b.city || "").trim(),
      },
    });

    if (error) {
      return NextResponse.json(
        { error: mapSupabaseAuthMessage(error.message) },
        { status: 400 }
      );
    }

    // --- WELCOME EMAIL ---
    const { email: providerStatus } = getProvidersStatus();
    const welcomeSubject = "Akademi Pro'ya Hoş Geldiniz!";
    const welcomeBody = `Merhaba ${fullName},\n\nAkademi Pro platformuna öğretmen olarak başarıyla kayıt oldunuz. Artık sanal sınıflarınızı oluşturabilir, öğrencilerinizle etkileşime geçebilir ve ödemelerinizi takip edebilirsiniz.\n\nİyi dersler dileriz!`;

    if (providerStatus.configured) {
      await sendEmailViaResend({
        to: email,
        subject: welcomeSubject,
        text: welcomeBody,
      });
    }

    await appendOutbox({
      channel: "email",
      to: email,
      title: welcomeSubject,
      body: welcomeBody,
      status: providerStatus.configured ? "sent" : "queued",
      provider: providerStatus.provider,
    });

    return NextResponse.json({ ok: true });
  }

  if (kind === "student_parent") {
    const b = body as StudentParentBody;
    const sEmail = (b.student?.email || "").trim();
    const pEmail = (b.parent?.email || "").trim();
    const sPass = b.student?.password || "";
    const pPass = b.parent?.password || "";
    const sName = (b.student?.fullName || "").trim() || "Öğrenci";
    const pName = (b.parent?.fullName || "").trim() || "Veli";
    const city = (b.city || "").trim();

    if (!validateEmail(sEmail) || !validateEmail(pEmail)) {
      return NextResponse.json({ error: "Geçerli e-posta adresleri girin." }, { status: 400 });
    }
    if (sEmail.toLowerCase() === pEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "Öğrenci ve veli e-postaları farklı olmalı." },
        { status: 400 }
      );
    }
    if (sPass.length < 6 || pPass.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalı." }, { status: 400 });
    }

    const createdIds: string[] = [];

    const rollback = async () => {
      for (const id of createdIds.reverse()) {
        await admin.auth.admin.deleteUser(id);
      }
    };

    const { data: parentData, error: parentErr } = await admin.auth.admin.createUser({
      email: pEmail,
      password: pPass,
      email_confirm: true,
      user_metadata: {
        role: "parent",
        full_name: pName,
        city,
      },
    });

    if (parentErr || !parentData.user) {
      return NextResponse.json(
        { error: mapSupabaseAuthMessage(parentErr?.message || "") },
        { status: 400 }
      );
    }
    createdIds.push(parentData.user.id);

    const { data: studentData, error: studentErr } = await admin.auth.admin.createUser({
      email: sEmail,
      password: sPass,
      email_confirm: true,
      user_metadata: {
        role: "student",
        full_name: sName,
        city,
      },
    });

    if (studentErr || !studentData.user) {
      await rollback();
      return NextResponse.json(
        { error: mapSupabaseAuthMessage(studentErr?.message || "") },
        { status: 400 }
      );
    }
    createdIds.push(studentData.user.id);

    const { error: relErr } = await admin.from("family_relations").insert({
      parent_id: parentData.user.id,
      student_id: studentData.user.id,
    });

    if (relErr) {
      await rollback();
      return NextResponse.json(
        { error: "Hesaplar oluşturuldu ancak bağlantı kaydedilemedi. Tekrar deneyin." },
        { status: 500 }
      );
    }

    // --- WELCOME EMAILS (Student & Parent) ---
    const { email: providerStatus } = getProvidersStatus();
    const studentsWelcome = `Merhaba ${sName},\n\nAkademi Pro platformuna hoş geldin! Öğretmeninin paylaştığı derslere katılabilir ve ödevlerini takip edebilirsin.`;
    const parentsWelcome = `Sayın ${pName},\n\nAkademi Pro'ya hoş geldiniz. Çocuğunuz ${sName} ile bağlantılı hesabınız oluşturuldu. Buradan ders programlarını ve ödeme durumlarını takip edebilirsiniz.`;

    const sendWelcome = async (to: string, sub: string, body: string) => {
      if (providerStatus.configured) {
        await sendEmailViaResend({ to, subject: sub, text: body });
      }
      await appendOutbox({
        channel: "email",
        to,
        title: sub,
        body,
        status: providerStatus.configured ? "sent" : "queued",
        provider: providerStatus.provider,
      });
    };

    await sendWelcome(sEmail, "Akademi Pro'ya Hoş Geldin!", studentsWelcome);
    await sendWelcome(pEmail, "Akademi Pro'ya Hoş Geldiniz!", parentsWelcome);

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Geçersiz kayıt türü." }, { status: 400 });
}
