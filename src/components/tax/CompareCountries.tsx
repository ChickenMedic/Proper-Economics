"use client";

import { useState } from "react";
import type { CountryTax } from "@/lib/tax";

const METRICS: { key: "topIncomeRate" | "corporateRate" | "vatRate" | "taxToGdp"; label: string; max: number }[] = [
  { key: "topIncomeRate", label: "Top personal income tax rate", max: 60 },
  { key: "corporateRate", label: "Corporate tax rate", max: 40 },
  { key: "vatRate", label: "Standard VAT / GST", max: 30 },
  { key: "taxToGdp", label: "Total tax revenue, % of GDP", max: 50 },
];

function Bar({ value, max, color }: { value: number | null; max: number; color: string }) {
  if (value === null)
    return <p className="text-sm text-(--fg-soft) italic">no national tax / no data — see table notes</p>;
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 flex-1 rounded-full bg-(--bg) border border-(--line) overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }}
        />
      </div>
      <span className="tabular-nums text-sm font-semibold w-14 text-right">{value}%</span>
    </div>
  );
}

export default function CompareCountries({ countries }: { countries: CountryTax[] }) {
  const [a, setA] = useState("SE");
  const [b, setB] = useState("US");
  const ca = countries.find((c) => c.iso === a);
  const cb = countries.find((c) => c.iso === b);

  const select = (value: string, onChange: (v: string) => void, label: string) => (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-(--fg-soft)">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-(--line) bg-(--bg-raised) px-3 py-1.5 text-sm"
      >
        {countries.map((c) => (
          <option key={c.iso} value={c.iso}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        {select(a, setA, "Compare")}
        {select(b, setB, "with")}
      </div>

      {ca && cb && (
        <div className="space-y-6">
          {METRICS.map((m) => (
            <div key={m.key} className="rounded-xl border border-(--line) bg-(--bg-raised) p-4">
              <h3 className="text-sm font-semibold mb-3">{m.label}</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-[7rem_1fr] gap-3 items-center">
                  <span className="text-sm truncate">{ca.name}</span>
                  <Bar value={ca[m.key]} max={m.max} color="var(--chart-demand)" />
                </div>
                <div className="grid grid-cols-[7rem_1fr] gap-3 items-center">
                  <span className="text-sm truncate">{cb.name}</span>
                  <Bar value={cb[m.key]} max={m.max} color="var(--chart-supply)" />
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-(--fg-soft)">
            Rates as of {ca.asOf} ({ca.name}) and {cb.asOf} ({cb.name}). Headline
            statutory rates hide plenty — thresholds, deductions, and social
            contributions differ hugely. Sources are linked per country in the table
            view.
          </p>
        </div>
      )}
    </div>
  );
}
