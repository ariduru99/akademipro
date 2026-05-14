import { NextResponse } from "next/server";
import { getProvidersStatus, listOutbox } from "@/lib/notifyServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await listOutbox(30);
  const providers = getProvidersStatus();
  return NextResponse.json({ entries, providers });
}
