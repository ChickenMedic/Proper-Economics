import Link from "next/link";
import { ERA_MAP } from "@/data/eras";
import { SCHOOL_MAP } from "@/data/schools";

export function SchoolBadge({ school, link = true }: { school: string; link?: boolean }) {
  const s = SCHOOL_MAP[school];
  if (!s) return null;
  const badge = (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--bg-raised) px-2.5 py-0.5 text-xs font-medium"
      style={{ borderColor: s.color }}
    >
      <span
        aria-hidden="true"
        className="size-2 rounded-full"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  );
  return link ? <Link href={`/schools/${s.id}/`}>{badge}</Link> : badge;
}

export function EraBadge({ era }: { era: string }) {
  const e = ERA_MAP[era];
  if (!e) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-(--line) bg-(--bg-raised) px-2.5 py-0.5 text-xs font-medium text-(--fg-soft)">
      {e.label}
      <span className="tabular-nums">
        {e.start}–{e.end >= 2026 ? "today" : e.end}
      </span>
    </span>
  );
}
