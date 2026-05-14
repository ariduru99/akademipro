import { NextRequest, NextResponse } from "next/server";
import {
  appendOutbox,
  getProvidersStatus,
  sendEmailViaResend,
} from "@/lib/notifyServer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { to?: string; title?: string; body?: string; kind?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const to = typeof body.to === "string" ? body.to.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";

  if (!to || !/^\S+@\S+\.\S+$/.test(to)) {
    return NextResponse.json(
      { error: "Geçerli bir e-posta adresi gerekli." },
      { status: 400 }
    );
  }
  if (!title || !text) {
    return NextResponse.json(
      { error: "Başlık ve içerik zorunludur." },
      { status: 400 }
    );
  }

  const { email } = getProvidersStatus();
  let status: "sent" | "queued" | "error" = "queued";
  let message = "Sağlayıcı yapılandırılmamış; outbox'a yazıldı.";

  if (email.configured) {
    const result = await sendEmailViaResend({
      to,
      subject: title,
      text,
    });
    status = result.ok ? "sent" : "error";
    message = result.ok ? "E-posta gönderildi." : result.message ?? "Bilinmeyen hata.";
  }

  const entry = await appendOutbox({
    channel: "email",
    to,
    title,
    body: text,
    status,
    provider: email.provider,
  });

  return NextResponse.json({
    status,
    provider: email.provider,
    message,
    id: entry.id,
  });
}
