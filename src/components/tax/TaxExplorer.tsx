"use client";

import { useState } from "react";
import type { TaxData } from "@/lib/tax";
import TaxTable from "./TaxTable";
import CompareCountries from "./CompareCountries";
import YouDecide from "./YouDecide";
import LafferCurve from "./LafferCurve";

const TABS = [
  { id: "table", label: "All countries" },
  { id: "compare", label: "Compare two" },
  { id: "you-decide", label: "You decide" },
  { id: "laffer", label: "The Laffer curve" },
] as const;

export default function TaxExplorer({ data }: { data: TaxData }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("table");

  return (
    <div>
      <div role="tablist" aria-label="Explorer views" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              tab === t.id
                ? "bg-(--accent) text-(--bg) border-(--accent)"
                : "border-(--line) bg-(--bg-raised) hover:border-(--accent)"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "table" && <TaxTable countries={data.countries} />}
        {tab === "compare" && <CompareCountries countries={data.countries} />}
        {tab === "you-decide" && <YouDecide />}
        {tab === "laffer" && <LafferCurve />}
      </div>
    </div>
  );
}
