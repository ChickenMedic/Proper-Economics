import type { Metadata } from "next";
import Link from "next/link";
import PriceSignals from "@/components/interactives/PriceSignals";

export const metadata: Metadata = {
  title: "Price Signals & the Calculation Problem",
  description:
    "Run a toy economy twice — once as a market, once as a central planner with frozen prices and late reports — and feel where planning breaks down.",
};

export default function PriceSignalsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-xs uppercase tracking-wide text-(--accent) font-medium">
        Interactive · 3 acts
      </p>
      <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold">
        Price Signals &amp; the Calculation Problem
      </h1>
      <p className="mt-3 max-w-2xl text-(--fg-soft)">
        A drought is coming to this little economy. First you&apos;ll watch prices
        handle it. Then the prices freeze, the reports run late, and it&apos;s your
        problem.
      </p>

      <div className="mt-8">
        <PriceSignals />
      </div>

      <p className="mt-8 text-sm text-(--fg-soft)">
        Based on the arguments of{" "}
        <Link href="/economists/ludwig-von-mises/" className="text-(--accent) underline">
          Ludwig von Mises
        </Link>{" "}
        and{" "}
        <Link href="/economists/friedrich-hayek/" className="text-(--accent) underline">
          Friedrich Hayek
        </Link>
        ; for the case that motivated planning, start with{" "}
        <Link href="/economists/karl-marx/" className="text-(--accent) underline">
          Karl Marx
        </Link>
        . A deliberately simplified teaching model, not a claim that six sliders
        capture the 20th century.
      </p>
    </div>
  );
}
