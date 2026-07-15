import type { Metadata } from "next";

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
        Taxes are where economic theory meets everyone&apos;s paycheck. This section is
        being built next — here&apos;s what&apos;s coming.
      </p>
      <div className="mt-8 space-y-4">
        <div className="rounded-xl border border-dashed border-(--line) p-6">
          <h2 className="font-display text-xl font-semibold">
            How we got here <span className="text-sm font-normal text-(--fg-soft)">— /tax/history</span>
          </h2>
          <p className="mt-2 text-sm text-(--fg-soft)">
            From Rome&apos;s tributum and the window tax to Pitt&apos;s wartime income tax,
            the 16th Amendment, 90% top rates, and the supply-side turn — a scrolling
            narrative linked to the economists whose ideas drove each change.
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-(--line) p-6">
          <h2 className="font-display text-xl font-semibold">
            How countries tax today{" "}
            <span className="text-sm font-normal text-(--fg-soft)">— /tax/today</span>
          </h2>
          <p className="mt-2 text-sm text-(--fg-soft)">
            A country-comparison explorer with sourced, dated figures for ~40
            countries — income, corporate, VAT, and tax-to-GDP — plus an honest
            interactive Laffer curve with its uncertainty shown, not hidden.
          </p>
        </div>
      </div>
    </div>
  );
}
