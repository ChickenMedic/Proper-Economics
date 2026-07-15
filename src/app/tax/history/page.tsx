import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getGlossaryTipMap, getTaxHistory } from "@/lib/content";
import { mdxComponents } from "@/components/mdx";

export function generateMetadata(): Metadata {
  const doc = getTaxHistory();
  if (!doc) return { title: "Taxes: how we got here" };
  return { title: doc.meta.title, description: doc.meta.description };
}

export default function TaxHistoryPage() {
  const doc = getTaxHistory();

  if (!doc) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-semibold">Taxes: how we got here</h1>
        <p className="mt-3 text-(--fg-soft)">This narrative is being written — check back soon.</p>
      </div>
    );
  }

  const fmtYear = (y: number) => (y < 0 ? `${-y} BC` : String(y));

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-wide text-(--accent) font-medium">
        The long story
      </p>
      <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold">
        {doc.meta.title}
      </h1>
      <p className="mt-3 text-lg text-(--fg-soft)">{doc.meta.description}</p>

      {doc.meta.episodes.length > 0 && (
        <nav aria-label="Episodes" className="mt-6 flex flex-wrap gap-2">
          {doc.meta.episodes.map((e) => (
            <a
              key={e.id}
              href={`#${e.id}`}
              className="rounded-full border border-(--line) bg-(--bg-raised) px-3 py-1 text-xs font-medium hover:border-(--accent) hover:text-(--accent) transition-colors"
            >
              <span className="tabular-nums text-(--fg-soft)">{fmtYear(e.year)}</span>{" "}
              {e.label}
            </a>
          ))}
        </nav>
      )}

      <div className="prose mt-8">
        <MDXRemote source={doc.body} components={mdxComponents(getGlossaryTipMap())} />
      </div>

      <div className="mt-12 rounded-xl border border-(--accent) bg-(--accent-soft) p-5">
        <p className="text-xs uppercase tracking-wide font-medium text-(--accent)">
          Keep going
        </p>
        <Link href="/tax/today/" className="mt-1 block font-display text-lg font-semibold hover:underline">
          How countries tax today →
        </Link>
        <p className="mt-1 text-sm text-(--fg-soft)">
          Sourced rates for ~45 countries, a compare tool, and the Laffer curve —
          with its uncertainty shown, not hidden.
        </p>
      </div>
    </article>
  );
}
