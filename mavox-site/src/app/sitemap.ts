import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ["", "/orcamento", "/privacidade", "/termos"].map((p) => ({ url: `${SITE.url}${p}`, lastModified: now, priority: p === "" ? 1 : 0.6 }));
}
