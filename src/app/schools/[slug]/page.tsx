import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getAllEconomists,
  getAllSchools,
  getGlossaryTipMap,
  getSchool,
} from "@/lib/content";
import { toCardData } from "@/lib/portraits";
import { mdxComponents } from "@/components/mdx";
import EconomistCard from "@/components/EconomistCard";
import { SCHOOL_MAP } from "@/data/schools";

export function generateStaticParams() {
  return getAllSchools().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getSchool(slug);
  if (!doc) return {};
  return { title: doc.meta.name, description: doc.meta.oneLiner };
}

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getSchool(slug);
  if (!doc) notFound();
  const { meta, body } = doc;

  const band = SCHOOL_MAP[slug];
  const economists = getAllEconomists();
  const figures = meta.keyFigures
    .map((s) => economists.find((e) => e.slug === s))
    .filter((e) => e !== undefined)
    .map(toCardData);

  return (
    <article className="mx-auto max-w-6xl px-4 py-12">
      <header className="max-w-3xl">
        <div className="flex items-center gap-3">
          {band && (
            <span
              aria-hidden="true"
              className="size-4 rounded-full"
              style={{ background: band.color }}
            />
          )}
          <h1 className="font-display text-3xl sm:text-4xl font-semibold">
            {meta.name}
          </h1>
          {band && (
            <span className="text-sm text-(--fg-soft) tabular-nums">
              {band.start}–{band.end >= 2026 ? "today" : band.end}
            </span>
          )}
        </div>
        <p className="mt-3 text-lg text-(--fg-soft) italic">{meta.oneLiner}</p>
      </header>

      <div className="prose mt-8">
        <MDXRemote source={body} components={mdxComponents(getGlossaryTipMap())} />
      </div>

      {figures.length > 0 && (
        <section aria-labelledby="figures" className="mt-12">
          <h2 id="figures" className="font-display text-2xl font-semibold mb-4">
            Key figures
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {figures.map((e) => (
              <EconomistCard key={e.slug} economist={e} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
