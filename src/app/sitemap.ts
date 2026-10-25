import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/peza/", "/boi/", "/services/", "/why-philippines/", "/inquire/", "/privacy/"];
  return paths.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "monthly", priority: p === "/" ? 1 : 0.7 }));
}
