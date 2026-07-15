import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllGlossary, getGlossaryTipMap } from "@/lib/content";
import { mdxComponents } from "@/components/mdx";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Every economics term on this site, defined in plain English — the same definitions that power the hover tooltips.",
};

export default function GlossaryPage() {
  const terms = getAllGlossary();
  const tips = getGlossaryTipMap();

  // Group alphabetically by first letter for a scannable directory.
  const groups = new Map<string, typeof terms>();
  for (const t of terms) {
    const letter = t.meta.term[0].toUpperCase();
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(t);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">Glossary</h1>
      <p className="mt-3 text-(--fg-soft)">
        Plain-English definitions — the same ones behind every dotted-underline
        tooltip on the site. {terms.length} terms and growing.
      </p>

      <nav aria-label="Alphabet" className="mt-6 flex flex-wrap gap-2 text-sm">
        {[...groups.keys()].map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="rounded border border-(--line) bg-(--bg-raised) px-2 py-0.5 hover:border-(--accent) hover:text-(--accent)"
          >
            {letter}
          </a>
        ))}
      </nav>

      <dl className="mt-8">
        {[...groups.entries()].map(([letter, entries]) => (
          <section key={letter} aria-labelledby={`letter-${letter}`}>
            <h2
              id={`letter-${letter}`}
              className="font-display text-2xl font-semibold text-(--accent) mt-10 mb-4 scroll-mt-20"
            >
              {letter}
            </h2>
            {entries.map((t) => (
              <div
                key={t.meta.slug}
                id={t.meta.slug}
                className="mb-8 scroll-mt-20 border-b border-(--line) pb-6"
              >
                <dt className="font-display text-lg font-semibold">{t.meta.term}</dt>
                <dd className="mt-2 prose text-[0.95rem]">
                  <MDXRemote source={t.body} components={mdxComponents(tips)} />
                  {t.meta.related.length > 0 && (
                    <p className="not-prose mt-2 text-sm text-(--fg-soft)">
                      Related:{" "}
                      {t.meta.related.map((r, i) => (
                        <span key={r}>
                          {i > 0 && ", "}
                          <a href={`#${r}`} className="text-(--accent) hover:underline">
                            {tips[r]?.term ?? r}
                          </a>
                        </span>
                      ))}
                    </p>
                  )}
                </dd>
              </div>
            ))}
          </section>
        ))}
      </dl>
    </div>
  );
}
