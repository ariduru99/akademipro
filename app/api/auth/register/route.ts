import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isSupabaseRegisterConfigured } from "@/lib/authEnv";
import { sendEmailViaResend, appendOutbox, getProvidersStatus } from "@/lib/notifyServer";

export const runtime = "nodejs";

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
        error: "Supabase kayıt için NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.",
      },
      { status: 503 }
    );
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Sunucu yapılandırması eksik." }, { status: 503 });
  }

  const contentType = req.headers.get("content-type") || "";
  let kind: string | undefined;
  let body: any = {};
  let file: File | null = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      kind = formData.get("kind") as string;
      if (kind === "teacher") {
        body = {
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          password: formData.get("password"),
          city: formData.get("city"),
          phone: formData.get("phone"),
          subject: formData.get("subject"),
          licenses: formData.get("licenses"),
        };
        file = formData.get("file") as File | null;
      }
    } else {
      body = await req.json();
      kind = body.kind;
    }
  } catch (e) {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  if (kind === "teacher") {
    const email = (body.email || "").trim();
    const password = body.password || "";
    const fullName = (body.fullName || "").trim() || "Öğretmen";
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Geçerli bir e-posta girin." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalı." }, { status: 400 });
    }

    const { data: userData, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        role: "teacher",
        full_name: fullName,
        city: (body.city || "").trim(),
        phone: (body.phone || "").trim(),
        subject: (body.subject || "").trim(),
        licenses: (body.licenses || "").trim(),
      },
    });

    if (error || !userData.user) {
      return NextResponse.json(
        { error: mapSupabaseAuthMessage(error?.message || "") },
        { status: 400 }
      );
    }

    if (file && file.size > 0) {
      try {
        const ext = file.name.split(".").pop();
        const filePath = `${userData.user.id}/license_${Date.now()}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        await admin.storage.from("teacher_documents").upload(filePath, buffer, {
          contentType: file.type,
          upsert: true,
        });
      } catch (err) {
        console.error("File upload error:", err);
      }
    }

    return NextResponse.json({ ok: true });
  }

  if (kind === "student_parent") {
    const sEmail = (body.student?.email || "").trim();
    const pEmail = (body.parent?.email || "").trim();
    const sPass = body.student?.password || "";
    const pPass = body.parent?.password || "";
    const sName = (body.student?.fullName || "").trim() || "Öğrenci";
    const pName = (body.parent?.fullName || "").trim() || "Veli";
    const city = (body.city || "").trim();

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
      email_confirm: false,
      user_metadata: {
        role: "parent",
        full_name: pName,
        city,
        phone: (body.parent?.phone || "").trim(),
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
      email_confirm: false,
      user_metadata: {
        role: "student",
        full_name: sName,
        city,
        phone: (body.student?.phone || "").trim(),
        grade: (body.student?.grade || "").trim(),
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

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Geçersiz kayıt türü." }, { status: 400 });
}
