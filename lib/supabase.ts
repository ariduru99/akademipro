import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/authEnv";

const cfg = getSupabasePublicConfig();

/** Tarayıcıda kullanım; geçersiz env'de null (createClient asla fırlatmaz). */
export const supabase = cfg
  ? createClient(cfg.url, cfg.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
