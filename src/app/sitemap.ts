import type { MetadataRoute } from "next";
import { getAllEconomists, getAllSchools } from "@/lib/content";
import modules from "@/data/modules.json";

export const dynamic = "force-static";

const BASE = "https://propereconomics.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const statics = [
    "",
    "/timeline",
    "/economists",
    "/schools",
    "/learn",
    "/tax",
    "/glossary",
    "/about",
  ].map((p) => ({ url: `${BASE}${p}/`.replace(/\/\/$/, "/") }));

  return [
    ...statics,
    ...getAllEconomists().map((e) => ({ url: `${BASE}/economists/${e.slug}/` })),
    ...getAllSchools().map((s) => ({ url: `${BASE}/schools/${s.slug}/` })),
    ...modules
      .filter((m) => m.status === "live")
      .map((m) => ({ url: `${BASE}/learn/${m.slug}/` })),
  ];
}
