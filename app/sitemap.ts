import type { MetadataRoute } from "next";

const baseUrl = "https://earnpets.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    "/",
    "/withdraw",
    "/claims",
    "/affiliate",
    "/redeem",
    "/support",
    "/faq",
    "/terms",
    "/privacy",
    "/profile",
  ];

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
  }));
}
