import type { Metadata } from "next";
import Link from "next/link";
import modules from "@/data/modules.json";

export const metadata: Metadata = {
  title: "Learn by playing",
  description:
    "Interactive economics: drag prices, trigger shocks, run a planned economy — and feel the ideas instead of memorizing them.",
};

export default function LearnPage() {
  const live = modules.filter((m) => m.status === "live");
  const roadmap = modules.filter((m) => m.status !== "live");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">
        Learn by playing
      </h1>
      <p className="mt-3 max-w-2xl text-(--fg-soft)">
        Economics makes a lot more sense when you can grab the price and move it
        yourself. Each module is a short guided story — one idea per screen, with a
        sandbox at the end.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {live.map((m) => (
          <Link
            key={m.slug}
            href={`/learn/${m.slug}/`}
            className="group rounded-xl border border-(--line) bg-(--bg-raised) p-6 hover:border-(--accent) transition-colors"
          >
            <h2 className="font-display text-xl font-semibold group-hover:text-(--accent) transition-colors">
              {m.title}
            </h2>
            <p className="mt-1 italic text-(--fg-soft)">{m.tagline}</p>
            <p className="mt-2 text-sm text-(--fg-soft)">{m.description}</p>
          </Link>
        ))}
      </div>

      {roadmap.length > 0 && (
        <section aria-labelledby="roadmap" className="mt-12">
          <h2 id="roadmap" className="font-display text-xl font-semibold text-(--fg-soft)">
            On the workbench
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roadmap.map((m) => (
              <li
                key={m.slug}
                className="rounded-xl border border-dashed border-(--line) p-4 text-sm text-(--fg-soft)"
              >
                <span className="font-medium text-(--fg)">{m.title}</span> —{" "}
                {m.tagline}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
