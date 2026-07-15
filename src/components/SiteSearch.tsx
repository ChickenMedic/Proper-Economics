"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

type Entry = {
  type: "economist" | "term" | "school" | "interactive";
  title: string;
  url: string;
  snippet: string;
  keywords: string;
};

const TYPE_LABEL: Record<Entry["type"], string> = {
  economist: "Economist",
  term: "Glossary",
  school: "School",
  interactive: "Interactive",
};

function score(entry: Entry, q: string): number {
  const title = entry.title.toLowerCase();
  if (title === q) return 100;
  if (title.startsWith(q)) return 60;
  if (title.includes(q)) return 40;
  if (entry.snippet.toLowerCase().includes(q)) return 20;
  if (entry.keywords.toLowerCase().includes(q)) return 10;
  return 0;
}

export default function SiteSearch() {
  const [index, setIndex] = useState<Entry[] | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // Lazy-load the index the first time the box is focused.
  const load = () => {
    if (index !== null) return;
    fetch("/search-index.json")
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => setIndex([]));
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const q = query.trim().toLowerCase();
  const results =
    q.length >= 2 && index
      ? index
          .map((e) => ({ e, s: score(e, q) }))
          .filter((r) => r.s > 0)
          .sort((a, b) => b.s - a.s)
          .slice(0, 8)
          .map((r) => r.e)
      : [];

  return (
    <div ref={rootRef} className="relative ml-auto">
      <input
        type="search"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        aria-label="Search economists, terms, and interactives"
        aria-autocomplete="list"
        placeholder="Search…"
        value={query}
        onFocus={() => {
          load();
          setOpen(true);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && results[active]) {
            window.location.href = results[active].url;
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="w-36 sm:w-48 rounded-full border border-(--line) bg-(--bg-raised) px-3 py-1.5 text-sm placeholder:text-(--fg-soft)"
      />
      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] rounded-lg border border-(--line) bg-(--bg-raised) shadow-xl overflow-hidden"
        >
          {results.map((r, i) => (
            <li key={r.url} role="option" aria-selected={i === active}>
              <Link
                href={r.url}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 text-sm ${
                  i === active ? "bg-(--accent-soft)" : ""
                } hover:bg-(--accent-soft)`}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">{r.title}</span>
                  <span className="text-xs text-(--fg-soft) shrink-0">
                    {TYPE_LABEL[r.type]}
                  </span>
                </span>
                <span className="block text-xs text-(--fg-soft) truncate">
                  {r.snippet}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
