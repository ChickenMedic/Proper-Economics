"use client";

import { Fragment, useState } from "react";
import type { CountryTax } from "@/lib/tax";

type SortKey = "name" | "topIncomeRate" | "corporateRate" | "vatRate" | "taxToGdp";

const COLS: { key: SortKey; label: string; unit?: string }[] = [
  { key: "name", label: "Country" },
  { key: "topIncomeRate", label: "Top income tax", unit: "%" },
  { key: "corporateRate", label: "Corporate tax", unit: "%" },
  { key: "vatRate", label: "VAT / GST", unit: "%" },
  { key: "taxToGdp", label: "Tax-to-GDP", unit: "%" },
];

function fmt(v: number | null, unit = "%"): string {
  return v === null ? " - " : `${v}${unit}`;
}

export default function TaxTable({ countries }: { countries: CountryTax[] }) {
  const [sort, setSort] = useState<SortKey>("name");
  const [desc, setDesc] = useState(false);
  const [region, setRegion] = useState("all");
  const [open, setOpen] = useState<string | null>(null);

  const regions = [...new Set(countries.map((c) => c.region))].sort();

  const rows = countries
    .filter((c) => region === "all" || c.region === region)
    .sort((a, b) => {
      if (sort === "name") return desc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      const av = a[sort] ?? -Infinity;
      const bv = b[sort] ?? -Infinity;
      return desc ? bv - av : av - bv;
    });

  const header = (col: (typeof COLS)[number]) => (
    <th key={col.key} scope="col" className="px-3 py-2 text-left whitespace-nowrap">
      <button
        onClick={() => {
          if (sort === col.key) setDesc(!desc);
          else {
            setSort(col.key);
            setDesc(col.key !== "name");
          }
        }}
        className="font-semibold hover:text-(--accent) inline-flex items-center gap-1"
        aria-label={`Sort by ${col.label}`}
      >
        {col.label}
        {sort === col.key && <span aria-hidden="true">{desc ? "↓" : "↑"}</span>}
      </button>
    </th>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="flex items-center gap-2 text-sm text-(--fg-soft)">
          Region
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-lg border border-(--line) bg-(--bg-raised) px-3 py-1.5 text-sm"
          >
            <option value="all">All regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-(--fg-soft)" role="status">
          {rows.length} countries · click a row for notes &amp; sources
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-(--line)">
        <table className="w-full text-sm bg-(--bg-raised)">
          <thead className="border-b border-(--line) text-(--fg-soft)">
            <tr>{COLS.map(header)}</tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <Fragment key={c.iso}>
                <tr
                  className="border-b border-(--line) last:border-0 hover:bg-(--accent-soft) cursor-pointer"
                  onClick={() => setOpen(open === c.iso ? null : c.iso)}
                >
                  <td className="px-3 py-2 font-medium whitespace-nowrap">
                    <button
                      className="inline-flex items-center gap-1.5"
                      aria-expanded={open === c.iso}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(open === c.iso ? null : c.iso);
                      }}
                    >
                      <span aria-hidden="true" className="text-(--fg-soft)">
                        {open === c.iso ? "▾" : "▸"}
                      </span>
                      {c.name}
                      {!c.oecd && (
                        <span className="text-[10px] uppercase tracking-wide text-(--fg-soft) border border-(--line) rounded px-1">
                          non-OECD
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{fmt(c.topIncomeRate)}</td>
                  <td className="px-3 py-2 tabular-nums">{fmt(c.corporateRate)}</td>
                  <td className="px-3 py-2 tabular-nums">{fmt(c.vatRate)}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {fmt(c.taxToGdp)}
                    {c.taxToGdp !== null && c.taxToGdpYear && (
                      <span className="text-xs text-(--fg-soft)"> ({c.taxToGdpYear})</span>
                    )}
                  </td>
                </tr>
                {open === c.iso && (
                  <tr className="border-b border-(--line) bg-(--bg)">
                    <td colSpan={5} className="px-6 py-3 text-xs text-(--fg-soft)">
                      <div className="space-y-1">
                        {c.topIncomeNote && <p>Income tax: {c.topIncomeNote}</p>}
                        {c.corporateNote && <p>Corporate: {c.corporateNote}</p>}
                        {c.vatNote && <p>VAT: {c.vatNote}</p>}
                        {c.taxToGdpNote && <p>Tax-to-GDP: {c.taxToGdpNote}</p>}
                        <p>
                          Rates as of {c.asOf}. Sources:{" "}
                          {c.sources.map((s, i) => (
                            <span key={s.url}>
                              {i > 0 && " · "}
                              <a
                                href={s.url}
                                rel="noopener"
                                className="text-(--accent) underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {s.label}
                              </a>
                            </span>
                          ))}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
