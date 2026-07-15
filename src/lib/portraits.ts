import fs from "node:fs";
import path from "node:path";
import type { EconomistMeta } from "./content";

/**
 * Returns the portrait URL only if the file actually exists in /public,
 * so a failed download renders as a monogram instead of a broken image.
 * Server-side only (fs).
 */
export function portraitSrc(
  economist: Pick<EconomistMeta, "portrait">,
): string | null {
  const src = economist.portrait?.src;
  if (!src) return null;
  const onDisk = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  return fs.existsSync(onDisk) ? src : null;
}

/** Serializable card payload for client components. */
export function toCardData(e: EconomistMeta) {
  return {
    slug: e.slug,
    name: e.name,
    born: e.born,
    died: e.died,
    nationality: e.nationality,
    school: e.school,
    era: e.era,
    knownFor: e.knownFor,
    flagship: e.flagship,
    portraitSrc: portraitSrc(e),
  };
}
