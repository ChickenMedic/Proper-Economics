import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getAllEconomists,
  getEconomist,
  getGlossaryTipMap,
  type EconomistMeta,
} from "@/lib/content";
import { portraitSrc } from "@/lib/portraits";
import { mdxComponents } from "@/components/mdx";
import Portrait from "@/components/Portrait";
import { EraBadge, SchoolBadge } from "@/components/Badges";
import modules from "@/data/modules.json";

export function generateStaticParams() {
  return getAllEconomists().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getEconomist(slug);
  if (!doc) return {};
  return {
    title: doc.meta.name,
    description: doc.meta.knownFor,
  };
}

function ConversationList({
  title,
  slugs,
  byName,
}: {
  title: string;
  slugs: string[];
  byName: Map<string, EconomistMeta>;
}) {
  if (!slugs.length) return null;
  return (
    <div>
      <h3 className="text-sm font-medium uppercase tracking-wide text-(--fg-soft)">
        {title}
      </h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {slugs.map((s) => {
          const other = byName.get(s);
          if (!other) return null;
          return (
            <li key={s}>
              <Link
                href={`/economists/${s}/`}
                className="inline-block rounded-full border border-(--line) bg-(--bg-raised) px-3 py-1 text-sm hover:border-(--accent) hover:text-(--accent) transition-colors"
              >
                {other.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default async function EconomistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getEconomist(slug);
  if (!doc) notFound();
  const { meta, body } = doc;

  const byName = new Map(getAllEconomists().map((e) => [e.slug, e]));
  const tips = getGlossaryTipMap();
  const tryIt = meta.tryIt ? modules.find((m) => m.slug === meta.tryIt) : null;
  const hasConversation =
    meta.influencedBy.length + meta.influenced.length + meta.arguedAgainst.length > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: meta.name,
    birthDate: String(meta.born),
    ...(meta.died ? { deathDate: String(meta.died) } : {}),
    nationality: meta.nationality,
    description: meta.knownFor,
    url: `https://propereconomics.com/economists/${meta.slug}/`,
  };

  return (
    <article className="mx-auto max-w-6xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <header className="flex flex-col sm:flex-row gap-6 sm:items-center max-w-3xl">
        <Portrait name={meta.name} src={portraitSrc(meta)} size="lg" />
        <div>
          <p className="text-sm text-(--fg-soft) tabular-nums">
            {meta.born}–{meta.died ?? "present"} · {meta.nationality}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            {meta.name}
          </h1>
          <p className="mt-3 text-lg text-(--fg-soft) leading-relaxed">
            {meta.knownFor}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <SchoolBadge school={meta.school} />
            <EraBadge era={meta.era} />
          </div>
        </div>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {/* Body */}
        <div className="prose">
          <MDXRemote source={body} components={mdxComponents(tips)} />

          {hasConversation && (
            <section aria-labelledby="conversation" className="not-prose mt-12">
              <h2
                id="conversation"
                className="font-display text-2xl font-semibold mb-4"
              >
                The conversation
              </h2>
              <div className="space-y-4">
                <ConversationList
                  title="Influenced by"
                  slugs={meta.influencedBy}
                  byName={byName}
                />
                <ConversationList
                  title="Influenced"
                  slugs={meta.influenced}
                  byName={byName}
                />
                <ConversationList
                  title="Argued against"
                  slugs={meta.arguedAgainst}
                  byName={byName}
                />
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8 lg:pt-2">
          {tryIt && (
            <div className="rounded-xl border border-(--accent) bg-(--accent-soft) p-5">
              <p className="text-xs uppercase tracking-wide font-medium text-(--accent)">
                Try it
              </p>
              <Link
                href={`/learn/${tryIt.slug}/`}
                className="mt-1 block font-display text-lg font-semibold hover:underline"
              >
                {tryIt.title} →
              </Link>
              <p className="mt-1 text-sm text-(--fg-soft)">{tryIt.tagline}</p>
            </div>
          )}

          {meta.works.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-semibold">Their own words</h2>
              <ul className="mt-3 space-y-3">
                {meta.works.map((w) => (
                  <li key={w.title} className="text-sm">
                    <a
                      href={w.url}
                      rel="noopener"
                      className="font-medium text-(--accent) hover:underline"
                    >
                      {w.title}
                    </a>{" "}
                    <span className="text-(--fg-soft) tabular-nums">({w.year})</span>
                    {w.free && (
                      <span className="ml-2 rounded-full bg-(--accent-soft) px-2 py-0.5 text-xs text-(--accent)">
                        free full text
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {meta.secondarySources.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-semibold">Go further</h2>
              <ul className="mt-3 space-y-3">
                {meta.secondarySources.map((s) => (
                  <li key={s.title} className="text-sm">
                    <a
                      href={s.url}
                      rel="noopener"
                      className="font-medium text-(--accent) hover:underline"
                    >
                      {s.title}
                    </a>
                    {s.author && (
                      <span className="block text-(--fg-soft)">{s.author}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {meta.videos.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-semibold">Watch</h2>
              <ul className="mt-3 space-y-3">
                {meta.videos.map((v) => (
                  <li key={v.url} className="text-sm">
                    <a
                      href={v.url}
                      rel="noopener"
                      target="_blank"
                      className="font-medium text-(--accent) hover:underline"
                    >
                      {v.title}
                    </a>
                    {v.channel && (
                      <span className="block text-(--fg-soft)">
                        {v.channel} · YouTube
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {meta.portrait && portraitSrc(meta) && (
            <p className="text-xs text-(--fg-soft)">
              Portrait:{" "}
              <a href={meta.portrait.source} rel="noopener" className="underline">
                Wikimedia Commons
              </a>
              , {meta.portrait.license}.
            </p>
          )}
        </aside>
      </div>
    </article>
  );
}
