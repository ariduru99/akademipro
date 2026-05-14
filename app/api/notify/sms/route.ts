import { NextRequest, NextResponse } from "next/server";
import {
  appendOutbox,
  getProvidersStatus,
  sendSmsViaTwilio,
} from "@/lib/notifyServer";

export const dynamic = "force-dynamic";

function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, "");
}

export async function POST(request: NextRequest) {
  let body: { to?: string; title?: string; body?: string; kind?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const toRaw = typeof body.to === "string" ? body.to.trim() : "";
  const to = normalizePhone(toRaw);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";

  if (!to || to.replace(/\D/g, "").length < 7) {
    return NextResponse.json(
      { error: "Geçerli bir telefon numarası gerekli." },
      { status: 400 }
    );
  }
  if (!title || !text) {
    return NextResponse.json(
      { error: "Başlık ve içerik zorunludur." },
      { status: 400 }
    );
  }

  const smsBody = `${title}\n${text}`.slice(0, 320);

  const { sms } = getProvidersStatus();
  let status: "sent" | "queued" | "error" = "queued";
  let message = "Sağlayıcı yapılandırılmamış; outbox'a yazıldı.";

  if (sms.configured) {
    const result = await sendSmsViaTwilio({ to, body: smsBody });
    status = result.ok ? "sent" : "error";
    message = result.ok ? "SMS gönderildi." : result.message ?? "Bilinmeyen hata.";
  }

  const entry = await appendOutbox({
    channel: "sms",
    to,
    title,
    body: smsBody,
    status,
    provider: sms.provider,
  });

  return NextResponse.json({
    status,
    provider: sms.provider,
    message,
    id: entry.id,
  });
}
