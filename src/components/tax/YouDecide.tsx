"use client";

import { useState } from "react";
import { Slider } from "@/components/interactives/InteractiveShell";

/**
 * Stylized tax regimes — deliberately simplified illustrations, not any real
 * country's tax code and not tax advice. Single earner, no deductions beyond
 * the stated allowance, employment income only.
 */
type Regime = {
  id: string;
  label: string;
  blurb: string;
  color: string;
  brackets: { upTo: number; rate: number }[]; // upTo = upper bound of bracket
};

const REGIMES: Regime[] = [
  {
    id: "flat",
    label: "Flat tax",
    blurb: "One rate for everyone above a small allowance (think Estonia-style).",
    color: "var(--chart-supply)",
    brackets: [
      { upTo: 12_000, rate: 0 },
      { upTo: Infinity, rate: 0.2 },
    ],
  },
  {
    id: "us",
    label: "US-style progressive",
    blurb: "Many brackets, moderate top rate, generous standard deduction.",
    color: "var(--chart-demand)",
    brackets: [
      { upTo: 14_000, rate: 0 },
      { upTo: 25_000, rate: 0.1 },
      { upTo: 60_000, rate: 0.12 },
      { upTo: 115_000, rate: 0.22 },
      { upTo: 205_000, rate: 0.24 },
      { upTo: 260_000, rate: 0.32 },
      { upTo: 625_000, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 },
    ],
  },
  {
    id: "nordic",
    label: "Nordic-style",
    blurb: "High rates that start low down the income scale — funding broad services.",
    color: "var(--chart-surplus)",
    brackets: [
      { upTo: 3_000, rate: 0 },
      { upTo: 55_000, rate: 0.34 },
      { upTo: 90_000, rate: 0.44 },
      { upTo: Infinity, rate: 0.55 },
    ],
  },
  {
    id: "gulf",
    label: "Zero income tax",
    blurb: "No personal income tax; government funded by oil, fees, and consumption taxes (Gulf-style).",
    color: "var(--chart-shortage)",
    brackets: [{ upTo: Infinity, rate: 0 }],
  },
];

function taxDue(income: number, r: Regime): number {
  let tax = 0;
  let prev = 0;
  for (const b of r.brackets) {
    const slice = Math.min(income, b.upTo) - prev;
    if (slice <= 0) break;
    tax += slice * b.rate;
    prev = b.upTo;
  }
  return tax;
}

const money = (v: number) =>
  v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function YouDecide() {
  const [income, setIncome] = useState(60_000);

  return (
    <div>
      <div className="max-w-md">
        <Slider
          label="Your yearly income"
          value={income}
          min={10_000}
          max={500_000}
          step={5_000}
          onChange={setIncome}
          format={money}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {REGIMES.map((r) => {
          const tax = taxDue(income, r);
          const eff = income > 0 ? (tax / income) * 100 : 0;
          return (
            <div key={r.id} className="rounded-xl border border-(--line) bg-(--bg-raised) p-4">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="size-3 rounded-full" style={{ background: r.color }} />
                <h3 className="font-semibold">{r.label}</h3>
              </div>
              <p className="mt-1 text-xs text-(--fg-soft)">{r.blurb}</p>
              <div className="mt-3 h-5 rounded-full bg-(--bg) border border-(--line) overflow-hidden" aria-hidden="true">
                <div
                  className="h-full"
                  style={{ width: `${Math.min(100, eff)}%`, background: r.color }}
                />
              </div>
              <p className="mt-2 text-sm tabular-nums">
                Tax <strong>{money(tax)}</strong> · keep <strong>{money(income - tax)}</strong>{" "}
                <span className="text-(--fg-soft)">({eff.toFixed(1)}% effective)</span>
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-(--fg-soft) max-w-2xl">
        These are <strong>simplified illustrations</strong>, not any country&apos;s
        actual tax code and not tax advice: single earner, employment income only,
        no social contributions, credits, or local taxes — all of which change the
        real picture a lot. The point is the <em>shape</em> of each system, not the
        exact bill. And remember the other half of the ledger: what the taxes buy
        differs just as much between these systems.
      </p>
    </div>
  );
}
