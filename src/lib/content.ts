import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ERA_MAP } from "@/data/eras";
import { SCHOOL_MAP } from "@/data/schools";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type Work = {
  title: string;
  year: number | string;
  url: string;
  free: boolean;
};

export type SecondarySource = {
  title: string;
  author?: string;
  url: string;
};

export type Portrait = {
  src: string;
  source: string;
  license: string;
  alt?: string;
};

export type Video = {
  title: string;
  channel?: string;
  url: string;
};

export type EconomistMeta = {
  name: string;
  slug: string;
  born: number;
  died: number | null; // null = still living
  nationality: string;
  school: string; // school id from src/data/schools.ts
  era: string; // era id from src/data/eras.ts
  knownFor: string;
  summary: string; // two short plain-text paragraphs separated by a blank line
  portrait?: Portrait;
  influencedBy: string[];
  influenced: string[];
  arguedAgainst: string[];
  works: Work[];
  secondarySources: SecondarySource[];
  videos: Video[]; // verified YouTube links about the economist and their ideas
  tryIt?: string; // learn-module slug
  flagship: boolean;
  tags: string[];
};

export type SchoolMeta = {
  slug: string;
  name: string;
  oneLiner: string;
  keyFigures: string[]; // economist slugs
};

export type GlossaryMeta = {
  slug: string;
  term: string;
  short: string; // one-line tooltip definition
  related: string[];
};

export type ContentDoc<M> = { meta: M; body: string };

function readDir(dir: string): string[] {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter((f) => f.endsWith(".mdx"));
}

function readDoc(dir: string, file: string) {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, dir, file), "utf8");
  const { data, content } = matter(raw);
  return { data, content, slug: file.replace(/\.mdx$/, "") };
}

function toEconomistMeta(data: Record<string, unknown>, slug: string): EconomistMeta {
  const meta = {
    influencedBy: [],
    influenced: [],
    arguedAgainst: [],
    works: [],
    secondarySources: [],
    videos: [],
    tags: [],
    flagship: false,
    ...(data as object),
    slug,
  } as unknown as EconomistMeta;

  if (!meta.name) throw new Error(`economists/${slug}: missing "name"`);
  if (!ERA_MAP[meta.era]) throw new Error(`economists/${slug}: unknown era "${meta.era}"`);
  if (!SCHOOL_MAP[meta.school])
    throw new Error(`economists/${slug}: unknown school "${meta.school}"`);
  return meta;
}

export function getAllEconomists(): EconomistMeta[] {
  return readDir("economists")
    .map((f) => {
      const { data, slug } = readDoc("economists", f);
      return toEconomistMeta(data, slug);
    })
    .sort((a, b) => a.born - b.born);
}

export function getEconomist(slug: string): ContentDoc<EconomistMeta> | null {
  const file = `${slug}.mdx`;
  if (!fs.existsSync(path.join(CONTENT_DIR, "economists", file))) return null;
  const { data, content } = readDoc("economists", file);
  return { meta: toEconomistMeta(data, slug), body: content };
}

export function getAllSchools(): SchoolMeta[] {
  return readDir("schools").map((f) => {
    const { data, slug } = readDoc("schools", f);
    return { keyFigures: [], ...(data as object), slug } as unknown as SchoolMeta;
  });
}

export function getSchool(slug: string): ContentDoc<SchoolMeta> | null {
  const file = `${slug}.mdx`;
  if (!fs.existsSync(path.join(CONTENT_DIR, "schools", file))) return null;
  const { data, content } = readDoc("schools", file);
  return {
    meta: { keyFigures: [], ...(data as object), slug } as unknown as SchoolMeta,
    body: content,
  };
}

export function getAllGlossary(): ContentDoc<GlossaryMeta>[] {
  return readDir("glossary")
    .map((f) => {
      const { data, content, slug } = readDoc("glossary", f);
      return {
        meta: { related: [], ...(data as object), slug } as unknown as GlossaryMeta,
        body: content,
      };
    })
    .sort((a, b) => a.meta.term.localeCompare(b.meta.term));
}

export type TaxHistoryMeta = {
  title: string;
  description: string;
  episodes: { year: number; id: string; label: string }[];
};

export function getTaxHistory(): ContentDoc<TaxHistoryMeta> | null {
  const file = path.join(CONTENT_DIR, "tax", "history.mdx");
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    meta: { episodes: [], ...(data as object) } as unknown as TaxHistoryMeta,
    body: content,
  };
}

/** slug -> one-line definition, used by the <G> tooltip component. */
export function getGlossaryTipMap(): Record<string, { term: string; short: string }> {
  return Object.fromEntries(
    getAllGlossary().map((g) => [g.meta.slug, { term: g.meta.term, short: g.meta.short }]),
  );
}
