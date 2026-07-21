import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tax",
  description:
    "Where economic theory meets your paycheck: the history of taxation and how countries tax today.",
};

export default function TaxHub() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">Tax</h1>
      <p className="mt-3 text-(--fg-soft)">
        Taxes are where economic theory meets everyone&apos;s paycheck - the ideas on
        this site made concrete, twice a month, on your payslip.
      </p>
      <div className="mt-8 space-y-4">
        <Link
          href="/tax/history/"
          className="group block rounded-xl border border-(--line) bg-(--bg-raised) p-6 hover:border-(--accent) transition-colors"
        >
          <h2 className="font-display text-xl font-semibold group-hover:text-(--accent) transition-colors">
            How we got here →
          </h2>
          <p className="mt-2 text-sm text-(--fg-soft)">
            From Rome&apos;s tributum and bricked-up windows to Pitt&apos;s wartime
            income tax, 90% top rates, the supply-side turn, and the global minimum
            corporate tax - with the economists whose ideas drove each change.
          </p>
        </Link>
        <Link
          href="/tax/today/"
          className="group block rounded-xl border border-(--line) bg-(--bg-raised) p-6 hover:border-(--accent) transition-colors"
        >
          <h2 className="font-display text-xl font-semibold group-hover:text-(--accent) transition-colors">
            How countries tax today →
          </h2>
          <p className="mt-2 text-sm text-(--fg-soft)">
            Sourced, dated rates for ~45 countries - income, corporate, VAT,
            tax-to-GDP - plus a side-by-side compare tool, a &ldquo;you
            decide&rdquo; regime calculator, and an honest Laffer curve.
          </p>
        </Link>
      </div>
      <p className="mt-8 text-sm text-(--fg-soft)">
        The main <Link href="/timeline/" className="text-(--accent) underline">timeline</Link>{" "}
        has a tax-history layer too - toggle it on to see how tax milestones line up
        with the economists.
      </p>
    </div>
  );
}
