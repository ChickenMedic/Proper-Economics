"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import EconomistCard, { type EconomistCardData } from "./EconomistCard";
import { ERAS } from "@/data/eras";
import { SCHOOLS } from "@/data/schools";

function Filters({ economists }: { economists: EconomistCardData[] }) {
  const params = useSearchParams();
  const [era, setEra] = useState(params.get("era") ?? "all");
  const [school, setSchool] = useState("all");

  const presentEras = useMemo(
    () => ERAS.filter((e) => economists.some((x) => x.era === e.id)),
    [economists],
  );
  const presentSchools = useMemo(
    () => SCHOOLS.filter((s) => economists.some((x) => x.school === s.id)),
    [economists],
  );

  const filtered = economists.filter(
    (e) => (era === "all" || e.era === era) && (school === "all" || e.school === school),
  );

  const selectClass =
    "rounded-lg border border-(--line) bg-(--bg-raised) px-3 py-1.5 text-sm";

  return (
    <>
      <div className="flex flex-wrap gap-3 items-center">
        <label className="flex items-center gap-2 text-sm text-(--fg-soft)">
          Era
          <select
            value={era}
            onChange={(e) => setEra(e.target.value)}
            className={selectClass}
          >
            <option value="all">All eras</option>
            {presentEras.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-(--fg-soft)">
          School
          <select
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className={selectClass}
          >
            <option value="all">All schools</option>
            {presentSchools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-(--fg-soft)" role="status">
          {filtered.length} of {economists.length}
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => (
          <EconomistCard key={e.slug} economist={e} />
        ))}
      </div>
    </>
  );
}

export default function EconomistIndex({
  economists,
}: {
  economists: EconomistCardData[];
}) {
  return (
    <Suspense>
      <Filters economists={economists} />
    </Suspense>
  );
}
