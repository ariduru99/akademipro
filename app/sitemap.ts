import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/siteUrl";

const SITE_URL = getSiteOrigin();

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/login", priority: 0.6, changeFrequency: "monthly" },
    { path: "/register", priority: 0.7, changeFrequency: "monthly" },
    { path: "/iletisim", priority: 0.5, changeFrequency: "yearly" },
    { path: "/gizlilik", priority: 0.4, changeFrequency: "yearly" },
    { path: "/kullanim-kosullari", priority: 0.4, changeFrequency: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
