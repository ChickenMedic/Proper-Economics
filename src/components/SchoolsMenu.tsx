"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SCHOOLS } from "@/data/schools";

export default function SchoolsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-(--fg-soft) hover:text-(--fg) transition-colors"
      >
        Schools
        <svg
          aria-hidden="true"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-(--line) bg-(--bg-raised) p-2 shadow-lg">
          <Link
            href="/schools/"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-(--accent-soft) hover:text-(--accent)"
          >
            All schools of thought →
          </Link>
          <div className="my-1 border-t border-(--line)" />
          <ul className="grid grid-cols-2 gap-x-1">
            {SCHOOLS.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/schools/${s.id}/`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm hover:bg-(--accent-soft) hover:text-(--accent)"
                >
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: s.color }}
                  />
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
