/** Site kökü; metadata / robots / sitemap için. Protokolsüz veya hatalı env uygulamayı düşürmez. */

export const DEFAULT_SITE_ORIGIN = "https://akademipro.tr";

export function getSiteOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (!raw) return DEFAULT_SITE_ORIGIN;
  const withProto = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== "http:" && u.protocol !== "https:") return DEFAULT_SITE_ORIGIN;
    return u.origin;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}
