import { NextRequest, NextResponse } from "next/server";
import { createJsonFileStore } from "@/lib/jsonFileStore";
import { sendEmailViaResend, getProvidersStatus } from "@/lib/notifyServer";

export const dynamic = "force-dynamic";

const newsletterStore = createJsonFileStore("newsletter-subscribers.json");

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
  }

  // Check if already subscribed
  const subscribers = await newsletterStore.read<string[]>([]);
  if (subscribers.includes(email)) {
    return NextResponse.json({ message: "Zaten bültenimize kayıtlısınız." }, { status: 200 });
  }

  // Save subscriber
  subscribers.push(email);
  await newsletterStore.write(subscribers);

  // Send confirmation email if configured
  const { email: provider } = getProvidersStatus();
  if (provider.configured) {
    await sendEmailViaResend({
      to: email,
      subject: "Bültenimize Hoş Geldiniz! - Akademi Pro",
      text: "Akademi Pro bültenine başarıyla kayıt oldunuz. Güncel eğitim haberleri ve ipuçları için bizi takipte kalın!",
    });
  }

  return NextResponse.json({ ok: true, message: "Bültenimize başarıyla kayıt oldunuz!" });
}
