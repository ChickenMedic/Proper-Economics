import type { Metadata } from "next";
import Link from "next/link";
import { getAllSchools } from "@/lib/content";
import { SCHOOL_MAP } from "@/data/schools";

export const metadata: Metadata = {
  title: "Schools of thought",
  description:
    "The big families of economic ideas - what each school claims, what it got right, and where it fell short.",
};

export default function SchoolsPage() {
  const schools = getAllSchools().sort(
    (a, b) => (SCHOOL_MAP[a.slug]?.start ?? 0) - (SCHOOL_MAP[b.slug]?.start ?? 0),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">
        Schools of thought
      </h1>
      <p className="mt-3 max-w-2xl text-(--fg-soft)">
        Economists cluster into families that share a core claim about how the world
        works. Each explainer gives the school its best case - then the honest
        counterarguments.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {schools.map((s) => {
          const band = SCHOOL_MAP[s.slug];
          return (
            <Link
              key={s.slug}
              href={`/schools/${s.slug}/`}
              className="group rounded-xl border border-(--line) bg-(--bg-raised) p-5 hover:border-(--accent) transition-colors"
            >
              <div className="flex items-center gap-2">
                {band && (
                  <span
                    aria-hidden="true"
                    className="size-3 rounded-full"
                    style={{ background: band.color }}
                  />
                )}
                <h2 className="font-display text-xl font-semibold group-hover:text-(--accent) transition-colors">
                  {s.name}
                </h2>
                {band && (
                  <span className="ml-auto text-xs text-(--fg-soft) tabular-nums">
                    {band.start}–{band.end >= 2026 ? "today" : band.end}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-(--fg-soft) italic">{s.oneLiner}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
