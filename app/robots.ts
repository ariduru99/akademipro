import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/siteUrl";

const SITE_URL = getSiteOrigin();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api/", "/login", "/register", "/sifremi-unuttum", "/auth"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
