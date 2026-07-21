import Link from "next/link";
import { ERAS } from "@/data/eras";
import { getAllEconomists } from "@/lib/content";
import { toCardData } from "@/lib/portraits";
import EconomistCard from "@/components/EconomistCard";
import modules from "@/data/modules.json";

export default function Home() {
  const flagships = getAllEconomists()
    .filter((e) => e.flagship)
    .map(toCardData);
  const live = modules.filter((m) => m.status === "live");

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="py-16 sm:py-24 max-w-3xl">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight tracking-tight">
          Every big idea in economics,{" "}
          <span className="text-(--accent)">explained so your neighbor gets it.</span>
        </h1>
        <p className="mt-6 text-lg text-(--fg-soft) leading-relaxed">
          From the mercantilists to the behavioral economists: who they were, what
          they actually argued, where it breaks down - in plain English, with
          interactive toys you can play with. Free. No accounts. No paywalls.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/timeline/"
            className="rounded-full bg-(--accent) px-5 py-2.5 text-sm font-medium text-(--bg) hover:opacity-90"
          >
            Explore the timeline
          </Link>
          <Link
            href="/learn/supply-and-demand/"
            className="rounded-full border border-(--line) bg-(--bg-raised) px-5 py-2.5 text-sm font-medium hover:border-(--accent)"
          >
            Play with supply &amp; demand
          </Link>
        </div>
      </section>

      {/* Interactives */}
      <section aria-labelledby="interactives-heading" className="py-8">
        <h2 id="interactives-heading" className="font-display text-2xl font-semibold">
          Don&apos;t read it - <em>feel</em> it
        </h2>
        <p className="mt-2 text-(--fg-soft) max-w-2xl">
          Wherever an idea can be a toy instead of a paragraph, it is.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {live.map((m) => (
            <Link
              key={m.slug}
              href={`/learn/${m.slug}/`}
              className="group rounded-xl border border-(--line) bg-(--bg-raised) p-6 hover:border-(--accent) transition-colors"
            >
              <p className="text-xs uppercase tracking-wide text-(--accent) font-medium">
                Interactive
              </p>
              <h3 className="mt-1 font-display text-xl font-semibold group-hover:text-(--accent) transition-colors">
                {m.title}
              </h3>
              <p className="mt-1 italic text-(--fg-soft)">{m.tagline}</p>
              <p className="mt-2 text-sm text-(--fg-soft)">{m.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Flagship profiles */}
      <section aria-labelledby="flagships-heading" className="py-8">
        <h2 id="flagships-heading" className="font-display text-2xl font-semibold">
          Start with the giants
        </h2>
        <p className="mt-2 text-(--fg-soft) max-w-2xl">
          Six thinkers who set the terms of the argument everyone else is still
          having.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flagships.map((e) => (
            <EconomistCard key={e.slug} economist={e} />
          ))}
        </div>
      </section>

      {/* Era entry points */}
      <section aria-labelledby="eras-heading" className="py-8 pb-16">
        <h2 id="eras-heading" className="font-display text-2xl font-semibold">
          Or follow the conversation through time
        </h2>
        <p className="mt-2 text-(--fg-soft) max-w-2xl">
          Ideas answer each other across centuries. Pick up the thread anywhere.
        </p>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {ERAS.map((era) => (
            <li key={era.id}>
              <Link
                href={`/economists/?era=${era.id}`}
                className="group flex gap-3 rounded-xl border border-(--line) bg-(--bg-raised) p-4 hover:border-(--accent) transition-colors h-full"
              >
                <span
                  aria-hidden="true"
                  className="mt-1 block h-full w-1 rounded-full shrink-0"
                  style={{ background: era.color }}
                />
                <span>
                  <span className="block font-display font-semibold group-hover:text-(--accent) transition-colors">
                    {era.label}{" "}
                    <span className="text-xs font-normal text-(--fg-soft) tabular-nums">
                      {era.start}–{era.end >= 2026 ? "today" : era.end}
                    </span>
                  </span>
                  <span className="block text-sm text-(--fg-soft) mt-0.5">
                    {era.blurb}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
