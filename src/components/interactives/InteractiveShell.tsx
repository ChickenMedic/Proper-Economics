"use client";

import { type ReactNode } from "react";

/**
 * Shared frame for all /learn modules: act navigation, the "What just
 * happened?" explainer panel (aria-live so screen readers hear every state
 * change), and a collapsible text alternative describing the demonstration.
 */
export function ActNav({
  acts,
  current,
  onSelect,
  unlocked,
}: {
  acts: string[];
  current: number;
  onSelect: (i: number) => void;
  unlocked: number; // highest act index reachable
}) {
  return (
    <nav aria-label="Acts" className="flex flex-wrap gap-2">
      {acts.map((label, i) => (
        <button
          key={label}
          onClick={() => onSelect(i)}
          disabled={i > unlocked}
          aria-current={i === current ? "step" : undefined}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors ${
            i === current
              ? "bg-(--accent) text-(--bg) border-(--accent)"
              : i <= unlocked
                ? "border-(--line) bg-(--bg-raised) hover:border-(--accent)"
                : "border-(--line) text-(--fg-soft) opacity-50 cursor-not-allowed"
          }`}
        >
          {i + 1}. {label}
        </button>
      ))}
    </nav>
  );
}

export function Explainer({ children }: { children: ReactNode }) {
  return (
    <div
      aria-live="polite"
      className="rounded-xl border border-(--accent) bg-(--accent-soft) p-4 text-sm leading-relaxed min-h-20"
    >
      <p className="text-xs uppercase tracking-wide font-medium text-(--accent) mb-1">
        What just happened?
      </p>
      {children}
    </div>
  );
}

export function TextAlternative({ children }: { children: ReactNode }) {
  return (
    <details className="mt-6 rounded-lg border border-(--line) p-4 text-sm text-(--fg-soft)">
      <summary className="cursor-pointer font-medium text-(--fg)">
        What this interactive demonstrates (text version)
      </summary>
      <div className="mt-3 space-y-2 leading-relaxed">{children}</div>
    </details>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = (v) => String(v),
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  disabled?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="flex justify-between">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-(--fg-soft)">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-(--accent)"
      />
    </label>
  );
}
