/**
 * Supabase ile canlı kimlik: URL + anon istemci anahtarı giriş için yeterli.
 * Kayıt API rotası ayrıca SUPABASE_SERVICE_ROLE_KEY ister.
 * Yer tutucu veya hatalı URL'ler createClient hatasına yol açmaması için doğrulanır.
 */

export function getSupabasePublicConfig(): { url: string; anonKey: string } | null {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  if (!url || !anonKey) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  } catch {
    return null;
  }
  return { url, anonKey };
}

export function isSupabaseClientConfigured(): boolean {
  return getSupabasePublicConfig() !== null;
}

export function isSupabaseRegisterConfigured(): boolean {
  return (
    isSupabaseClientConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())
  );
}
