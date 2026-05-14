import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/authEnv";

/** Sunucu tarafı (API route): service role ile auth.users oluşturma — istemciye verilmez. */
export function createSupabaseAdmin(): SupabaseClient | null {
  const cfg = getSupabasePublicConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!cfg || !key) return null;
  return createClient(cfg.url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
