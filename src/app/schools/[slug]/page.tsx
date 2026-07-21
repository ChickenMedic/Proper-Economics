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
import Link from "next/link";
import EconomistCard from "@/components/EconomistCard";
import { SCHOOLS, SCHOOL_MAP } from "@/data/schools";

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
  // SCHOOLS is in chronological order — walk it for previous/next idea.
  const order = SCHOOLS.findIndex((s) => s.id === slug);
  const prevSchool = order > 0 ? SCHOOLS[order - 1] : null;
  const nextSchool = order >= 0 && order < SCHOOLS.length - 1 ? SCHOOLS[order + 1] : null;
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

      {(prevSchool || nextSchool) && (
        <nav
          aria-label="Neighboring schools of thought"
          className="mt-12 flex flex-wrap justify-between gap-3 border-t border-(--line) pt-6"
        >
          {prevSchool ? (
            <Link
              href={`/schools/${prevSchool.id}/`}
              className="group rounded-xl border border-(--line) bg-(--bg-raised) px-4 py-3 hover:border-(--accent) transition-colors"
            >
              <span className="block text-xs uppercase tracking-wide text-(--fg-soft)">
                ← Previous idea
              </span>
              <span className="mt-0.5 block font-display font-semibold group-hover:text-(--accent) transition-colors">
                {prevSchool.label}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {nextSchool && (
            <Link
              href={`/schools/${nextSchool.id}/`}
              className="group rounded-xl border border-(--line) bg-(--bg-raised) px-4 py-3 text-right hover:border-(--accent) transition-colors"
            >
              <span className="block text-xs uppercase tracking-wide text-(--fg-soft)">
                Next idea →
              </span>
              <span className="mt-0.5 block font-display font-semibold group-hover:text-(--accent) transition-colors">
                {nextSchool.label}
              </span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
