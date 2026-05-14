import { randomUUID } from "crypto";
import { createJsonFileStore } from "@/lib/jsonFileStore";

export type OutboxEntry = {
  id: string;
  channel: "email" | "sms";
  to: string;
  title: string;
  body: string;
  status: "queued" | "sent" | "error";
  provider: string;
  createdAt: string;
};

const outboxStore = createJsonFileStore("notifications-outbox.json");
const MAX_ENTRIES = 100;

async function readOutbox(): Promise<OutboxEntry[]> {
  const parsed = await outboxStore.read<unknown>([]);
  if (!Array.isArray(parsed)) return [];
  return parsed as OutboxEntry[];
}

async function writeOutbox(entries: OutboxEntry[]): Promise<void> {
  await outboxStore.write(entries);
}

export async function appendOutbox(
  entry: Omit<OutboxEntry, "id" | "createdAt">
): Promise<OutboxEntry> {
  const list = await readOutbox();
  const next: OutboxEntry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry,
  };
  list.push(next);
  if (list.length > MAX_ENTRIES) list.splice(0, list.length - MAX_ENTRIES);
  await writeOutbox(list);
  return next;
}

export async function listOutbox(limit = 30): Promise<OutboxEntry[]> {
  const list = await readOutbox();
  return [...list]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

/* ------------------- Sağlayıcı yapılandırma kontrolü ------------------- */

export type ProvidersStatus = {
  email: { configured: boolean; provider: string };
  sms: { configured: boolean; provider: string };
};

export function getProvidersStatus(): ProvidersStatus {
  const emailConfigured = Boolean(
    process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL_FROM
  );
  const smsConfigured = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM
  );
  return {
    email: {
      configured: emailConfigured,
      provider: emailConfigured ? "Resend" : "Outbox (simülasyon)",
    },
    sms: {
      configured: smsConfigured,
      provider: smsConfigured ? "Twilio" : "Outbox (simülasyon)",
    },
  };
}

/* ------------------- Gerçek sağlayıcı çağrıları ------------------- */

export async function sendEmailViaResend(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: boolean; message?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_EMAIL_FROM;
  if (!apiKey || !from) return { ok: false, message: "Resend env eksik" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      let detail = raw.slice(0, 400);
      try {
        const parsed = JSON.parse(raw) as { message?: string; name?: string };
        if (parsed?.message) detail = parsed.message;
      } catch {
        // raw text fallback
      }
      return { ok: false, message: `Resend ${res.status}: ${detail}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function sendSmsViaTwilio(opts: {
  to: string;
  body: string;
}): Promise<{ ok: boolean; message?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) return { ok: false, message: "Twilio env eksik" };
  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const params = new URLSearchParams({
      To: opts.to,
      From: from,
      Body: opts.body,
    });
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, message: `Twilio ${res.status}: ${t.slice(0, 120)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
