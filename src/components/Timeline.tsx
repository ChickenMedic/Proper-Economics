"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { scaleLinear } from "d3-scale";
import { ERAS } from "@/data/eras";
import { SCHOOLS, SCHOOL_MAP } from "@/data/schools";
import eventsData from "@/data/events.json";

export type TimelineEconomist = {
  slug: string;
  name: string;
  born: number;
  died: number | null;
  era: string;
  school: string;
  knownFor: string;
  summary: string;
  flagship: boolean;
  influencedBy: string[];
  arguedAgainst: string[];
};

const YEAR_MIN = 1550;
const YEAR_MAX = 2026;
// The axis runs past YEAR_MAX so the crowded modern era isn't pressed
// against the right edge of the chart.
const DOMAIN_END = 2045;
const ROW_H = 34;
const BAND_H = 18;
const EVENT_ROW_H = 20;
// Rough average glyph widths used for fit checks (px per char).
const NAME_CHAR_W = 7.2; // 12.5px bar labels
const EVENT_CHAR_W = 6.1; // 10.5px event labels

type Layers = { schools: boolean; world: boolean; tax: boolean };

/** Greedy lane packing so lifespans don't overlap. */
function packLanes(list: TimelineEconomist[]): Map<string, number> {
  const laneEnds: number[] = [];
  const lanes = new Map<string, number>();
  for (const e of [...list].sort((a, b) => a.born - b.born)) {
    const end = (e.died ?? YEAR_MAX) + 6;
    let lane = laneEnds.findIndex((le) => le < e.born - 4);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }
    lanes.set(e.slug, lane);
  }
  return lanes;
}

export default function Timeline({ economists }: { economists: TimelineEconomist[] }) {
  const [domain, setDomain] = useState<[number, number]>([YEAR_MIN, DOMAIN_END]);
  // Layers start off so the chart stays compact and the info card is in view.
  const [layers, setLayers] = useState<Layers>({ schools: false, world: false, tax: false });
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [hoveredSchool, setHoveredSchool] = useState<string | null>(null);

  // Open with a random economist selected so the card introduces itself.
  // Must happen after mount: a random pick during server rendering would
  // not match the static HTML at hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only random initial selection; cannot be computed during SSR
    setSelected(
      (s) => s ?? economists[Math.floor(Math.random() * economists.length)]?.slug ?? null,
    );
  }, [economists]);
  const dragging = useRef<{ startX: number; startDomain: [number, number] } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 960;
  const M = { left: 16, right: 16, top: 40, bottom: 8 };

  const lanes = useMemo(() => packLanes(economists), [economists]);
  const laneCount = Math.max(...[...lanes.values()], 0) + 1;

  const x = scaleLinear().domain(domain).range([M.left, W - M.right]);

  const events = [
    ...(layers.world ? eventsData.world.map((e) => ({ ...e, layer: "world" })) : []),
    ...(layers.tax ? eventsData.tax.map((e) => ({ ...e, layer: "tax" })) : []),
  ].filter((e) => e.year >= domain[0] && e.year <= domain[1]);

  // Lay event labels out greedily: full text (never truncated), first row
  // where it fits, flipped to the dot's left near the right edge. An event
  // whose label fits nowhere keeps its dot + tooltip but drops the text.
  const placedEvents = (() => {
    const rows: { start: number; end: number }[][] = [];
    const placed = [...events]
      .sort((a, b) => a.year - b.year)
      .map((ev) => {
        const cx = x(ev.year);
        const text = `${ev.year} ${ev.label}`;
        const w = text.length * EVENT_CHAR_W;
        const right = { start: cx + 7, end: cx + 7 + w };
        const left = { start: cx - 7 - w, end: cx - 7 };
        const options = right.end <= W - M.right ? [right, left] : [left, right];
        for (let r = 0; r < 14; r++) {
          rows[r] ??= [];
          for (const o of options) {
            if (o.start < M.left || o.end > W - M.right) continue;
            if (rows[r].every((p) => o.end + 8 <= p.start || o.start >= p.end + 8)) {
              rows[r].push(o);
              return { ev, cx, text, row: r, flip: o === left, labeled: true };
            }
          }
        }
        return { ev, cx, text, row: 0, flip: false, labeled: false };
      });
    const rowCount = Math.max(1, ...placed.map((p) => p.row + 1));
    return { placed, rowCount };
  })();

  const schoolRows = layers.schools ? SCHOOLS.length : 0;
  const eventsH =
    layers.world || layers.tax ? placedEvents.rowCount * EVENT_ROW_H + 12 : 0;
  const H =
    M.top + laneCount * ROW_H + 12 + schoolRows * (BAND_H + 4) + eventsH + M.bottom;

  const clampDomain = (d: [number, number]): [number, number] => {
    let a = d[0];
    const b = d[1];
    const span = Math.max(30, Math.min(DOMAIN_END - YEAR_MIN, b - a));
    a = Math.max(YEAR_MIN, Math.min(a, DOMAIN_END - span));
    return [a, a + span];
  };

  const zoom = (factor: number, centerYear?: number) => {
    setDomain(([a, b]) => {
      const c = centerYear ?? (a + b) / 2;
      return clampDomain([c - (c - a) * factor, c + (b - c) * factor]);
    });
  };

  const pan = (years: number) =>
    setDomain(([a, b]) => clampDomain([a + years, b + years]));

  const sel = selected ? economists.find((e) => e.slug === selected) : null;
  const selSchool = selectedSchool ? SCHOOL_MAP[selectedSchool] : null;
  // Hover previews a school; clicking pins it (and works for touch/keyboard).
  const activeSchool = hoveredSchool ?? selectedSchool;
  const byLane = (slug: string) => M.top + (lanes.get(slug) ?? 0) * ROW_H;

  const connections =
    sel &&
    [
      ...sel.influencedBy.map((t) => ({ to: t, kind: "influenced by" as const })),
      ...sel.arguedAgainst.map((t) => ({ to: t, kind: "argued against" as const })),
    ].filter((c) => economists.some((e) => e.slug === c.to));

  const toggleBtn = (on: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      on
        ? "bg-(--accent) text-(--bg) border-(--accent)"
        : "border-(--line) bg-(--bg-raised) hover:border-(--accent)"
    }`;

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Layers" className="flex flex-wrap gap-2">
          <button
            className={toggleBtn(layers.schools)}
            aria-pressed={layers.schools}
            onClick={() => setLayers((l) => ({ ...l, schools: !l.schools }))}
          >
            Schools of thought
          </button>
          <button
            className={toggleBtn(layers.world)}
            aria-pressed={layers.world}
            onClick={() => setLayers((l) => ({ ...l, world: !l.world }))}
          >
            World events
          </button>
          <button
            className={toggleBtn(layers.tax)}
            aria-pressed={layers.tax}
            onClick={() => setLayers((l) => ({ ...l, tax: !l.tax }))}
          >
            Tax history
          </button>
        </div>
        <div role="group" aria-label="Zoom" className="ml-auto flex gap-2">
          <button className={toggleBtn(false)} onClick={() => zoom(0.7)} aria-label="Zoom in">
            +
          </button>
          <button className={toggleBtn(false)} onClick={() => zoom(1.45)} aria-label="Zoom out">
            −
          </button>
          <button
            className={toggleBtn(false)}
            onClick={() => setDomain([YEAR_MIN, DOMAIN_END])}
          >
            Reset
          </button>
        </div>
      </div>

      {/* The chart (desktop/tablet) */}
      <div
        className="mt-4 hidden sm:block rounded-xl border border-(--line) bg-(--bg-raised) p-2"
        onWheel={(e) => {
          if (!e.ctrlKey) return;
          e.preventDefault();
          const rect = svgRef.current?.getBoundingClientRect();
          if (!rect) return;
          const year = x.invert(((e.clientX - rect.left) / rect.width) * W);
          zoom(e.deltaY > 0 ? 1.2 : 0.85, year);
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto select-none touch-pan-y cursor-grab active:cursor-grabbing"
          role="img"
          aria-label={`Timeline of ${economists.length} economists from ${domain[0]} to ${domain[1]}. Use the list below the chart for full keyboard access.`}
          tabIndex={0}
          onKeyDown={(e) => {
            const span = domain[1] - domain[0];
            if (e.key === "ArrowLeft") pan(-span * 0.1);
            if (e.key === "ArrowRight") pan(span * 0.1);
            if (e.key === "+" || e.key === "=") zoom(0.7);
            if (e.key === "-") zoom(1.45);
          }}
          onPointerDown={(e) => {
            dragging.current = { startX: e.clientX, startDomain: domain };
            (e.target as Element).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!dragging.current || !svgRef.current) return;
            const rect = svgRef.current.getBoundingClientRect();
            const dYears =
              ((dragging.current.startX - e.clientX) / rect.width) *
              (dragging.current.startDomain[1] - dragging.current.startDomain[0]);
            setDomain(
              clampDomain([
                dragging.current.startDomain[0] + dYears,
                dragging.current.startDomain[1] + dYears,
              ]),
            );
          }}
          onPointerUp={() => (dragging.current = null)}
        >
          {/* Era backgrounds + decade ticks */}
          {ERAS.map((era) => {
            const x0 = Math.max(x(era.start), M.left);
            const x1 = Math.min(x(era.end), W - M.right);
            if (x1 <= x0) return null;
            return (
              <g key={era.id}>
                <rect
                  x={x0}
                  y={M.top - 4}
                  width={x1 - x0}
                  height={laneCount * ROW_H}
                  fill={era.color}
                  opacity={0.06}
                />
                {x1 - x0 > era.label.length * 6.5 && (
                  <text x={x0 + 4} y={M.top - 10} fontSize={10} fill="var(--fg-soft)">
                    {era.label}
                  </text>
                )}
              </g>
            );
          })}
          {/* Faint school names behind the bars - context even with the
              school-bands layer off. Each school gets its own vertical slot
              so the twelve labels never collide. */}
          {SCHOOLS.map((s, i) => {
            const x0 = Math.max(x(s.start), M.left);
            const x1 = Math.min(x(s.end), W - M.right);
            if (x1 - x0 < 70) return null;
            // Pick a label that roughly fits the visible span (generous
            // overhang allowed); fall back to the first word, else drop out.
            const fits = (t: string) => t.length * 13 <= (x1 - x0) * 1.7;
            const label = fits(s.label) ? s.label : s.label.split(" ")[0];
            if (!fits(label)) return null;
            // Clamp so the text never clips at the plot edges.
            const half = (label.length * 13) / 2;
            const cx = Math.min(
              Math.max((x0 + x1) / 2, M.left + half),
              W - M.right - half,
            );
            return (
              <text
                key={s.id}
                x={cx}
                y={M.top + ((i + 0.65) / SCHOOLS.length) * laneCount * ROW_H}
                fontSize={26}
                fontWeight={700}
                textAnchor="middle"
                fill={s.color}
                opacity={sel?.school === s.id || activeSchool === s.id ? 0.32 : 0.14}
                pointerEvents="none"
                className="font-display select-none"
              >
                {label}
              </text>
            );
          })}

          {x.ticks(8).map((t) => (
            <g key={t}>
              <line
                x1={x(t)}
                x2={x(t)}
                y1={M.top - 4}
                y2={H - M.bottom}
                stroke="var(--line)"
                strokeWidth={1}
              />
              <text
                x={x(t)}
                y={H - M.bottom}
                fontSize={10}
                textAnchor="middle"
                fill="var(--fg-soft)"
              >
                {t}
              </text>
            </g>
          ))}

          {/* Connection arrows */}
          {connections?.map((c) => {
            const from = economists.find((e) => e.slug === selected)!;
            const to = economists.find((e) => e.slug === c.to)!;
            const x1 = x((from.born + (from.died ?? YEAR_MAX)) / 2);
            const y1 = byLane(from.slug) + 11.5;
            const x2 = x((to.born + (to.died ?? YEAR_MAX)) / 2);
            const y2 = byLane(to.slug) + 11.5;
            const midY = Math.min(y1, y2) - 24;
            return (
              <g key={`${c.kind}-${c.to}`}>
                <path
                  d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${midY} ${x2} ${y2}`}
                  fill="none"
                  stroke={c.kind === "argued against" ? "var(--chart-shortage)" : "var(--accent)"}
                  strokeWidth={1.8}
                  strokeDasharray={c.kind === "argued against" ? "5 3" : undefined}
                  opacity={0.85}
                />
                <circle cx={x2} cy={y2} r={3.5} fill={c.kind === "argued against" ? "var(--chart-shortage)" : "var(--accent)"} />
              </g>
            );
          })}

          {/* Arrow legend - shown while a selection has connections */}
          {connections && connections.length > 0 && (
            <g fontSize={10.5} fill="var(--fg-soft)">
              <line
                x1={W - M.right - 252}
                x2={W - M.right - 224}
                y1={10}
                y2={10}
                stroke="var(--accent)"
                strokeWidth={2}
              />
              <text x={W - M.right - 218} y={13.5}>
                influenced by
              </text>
              <line
                x1={W - M.right - 124}
                x2={W - M.right - 96}
                y1={10}
                y2={10}
                stroke="var(--chart-shortage)"
                strokeWidth={2}
                strokeDasharray="5 3"
              />
              <text x={W - M.right - 90} y={13.5}>
                argued against
              </text>
            </g>
          )}

          {/* Economist lifespan bars */}
          {economists.map((e) => {
            const died = e.died ?? YEAR_MAX;
            if (died < domain[0] || e.born > domain[1]) return null;
            const bx = Math.max(x(e.born), M.left);
            const bw = Math.max(6, Math.min(x(died), W - M.right) - bx);
            const by = byLane(e.slug);
            const color = SCHOOL_MAP[e.school]?.color ?? "var(--accent)";
            const isSel = selected === e.slug;
            const dimmed = activeSchool !== null && e.school !== activeSchool;
            return (
              <g
                key={e.slug}
                onClick={() => {
                  setSelected(isSel ? null : e.slug);
                  setSelectedSchool(null);
                }}
                className="cursor-pointer"
                opacity={dimmed ? 0.15 : 1}
              >
                <rect
                  x={bx}
                  y={by + 3}
                  width={bw}
                  height={17}
                  rx={2}
                  fill={color}
                  opacity={isSel || (activeSchool !== null && !dimmed) ? 1 : 0.75}
                  stroke={isSel ? "var(--fg)" : "none"}
                  strokeWidth={1.5}
                >
                  <title>{`${e.name} (${e.born}–${e.died ?? ""}): ${e.knownFor}`}</title>
                </rect>
                {bw > 64 && (
                  <text
                    x={bx + bw / 2}
                    y={by + 15.9}
                    fontSize={12.5}
                    fontWeight={e.flagship ? 700 : 500}
                    fill="var(--bg)"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {/* fall back to surname when the full name overflows the bar */}
                    {e.name.length * NAME_CHAR_W < bw - 12
                      ? e.name
                      : e.name.split(" ").slice(-1)[0]}
                  </text>
                )}
              </g>
            );
          })}

          {/* School bands - hover or focus to highlight members, click to pin */}
          {layers.schools &&
            SCHOOLS.map((s, i) => {
              const y0 = M.top + laneCount * ROW_H + 12 + i * (BAND_H + 4);
              const x0 = Math.max(x(s.start), M.left);
              const x1 = Math.min(x(s.end), W - M.right);
              if (x1 <= x0) return null;
              const isActive = activeSchool === s.id;
              return (
                <g
                  key={s.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredSchool(s.id)}
                  onMouseLeave={() => setHoveredSchool(null)}
                  onClick={() => {
                    setSelectedSchool(selectedSchool === s.id ? null : s.id);
                    setSelected(null);
                  }}
                >
                  <rect
                    x={x0}
                    y={y0}
                    width={x1 - x0}
                    height={BAND_H}
                    rx={4}
                    fill={s.color}
                    opacity={isActive ? 0.7 : 0.35}
                    stroke={selectedSchool === s.id ? "var(--fg)" : "none"}
                    strokeWidth={1.5}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectedSchool === s.id}
                    aria-label={`${s.label} school of thought - highlight its economists`}
                    onFocus={() => setHoveredSchool(s.id)}
                    onBlur={() => setHoveredSchool(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedSchool(selectedSchool === s.id ? null : s.id);
                        setSelected(null);
                      }
                    }}
                  >
                    <title>{`${s.label} (${s.start}–${s.end >= 2026 ? "today" : s.end}): ${s.oneLiner}`}</title>
                  </rect>
                  {x1 - x0 > 90 && (
                    <text
                      x={x0 + 6}
                      y={y0 + 13.5}
                      fontSize={11}
                      fontWeight={isActive ? 600 : 400}
                      fill="var(--fg)"
                      pointerEvents="none"
                    >
                      {s.label}
                    </text>
                  )}
                </g>
              );
            })}

          {/* Event markers - full labels, packed into rows so nothing
              overlaps or truncates; near the right edge the label sits to
              the dot's left. */}
          {placedEvents.placed.map(({ ev, cx, text, row, flip, labeled }) => {
            const y0 = H - M.bottom - eventsH + 10 + row * EVENT_ROW_H;
            return (
              <g key={`${ev.layer}-${ev.label}`}>
                <line
                  x1={cx}
                  x2={cx}
                  y1={M.top - 4}
                  y2={y0}
                  stroke={ev.layer === "tax" ? "var(--chart-supply)" : "var(--fg-soft)"}
                  strokeWidth={1}
                  strokeDasharray="2 3"
                  opacity={0.4}
                />
                <circle
                  cx={cx}
                  cy={y0}
                  r={4}
                  fill={ev.layer === "tax" ? "var(--chart-supply)" : "var(--fg-soft)"}
                >
                  <title>{`${ev.year} - ${ev.label}: ${ev.note}`}</title>
                </circle>
                {labeled && (
                  <text
                    x={flip ? cx - 7 : cx + 7}
                    y={y0 + 3.5}
                    fontSize={10.5}
                    textAnchor={flip ? "end" : "start"}
                    fill="var(--fg-soft)"
                  >
                    {text}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <p className="px-2 pb-1 text-xs text-(--fg-soft)">
          Drag to pan · Ctrl+scroll or buttons to zoom · click a bar for details and
          influence arrows
          {layers.schools &&
            " · hover or click a school band to highlight its economists"}
        </p>
      </div>

      {/* Selected economist card */}
      {sel &&
        (() => {
          const sch = SCHOOL_MAP[sel.school];
          return (
            <div className="mt-4 rounded-xl border border-(--line) bg-(--bg-raised) overflow-hidden hidden sm:block">
              <div
                aria-hidden="true"
                className="h-1.5"
                style={{ background: sch?.color ?? "var(--accent)" }}
              />
              <div className="p-5">
                <div className="text-center">
                  <h2 className="font-display text-2xl font-semibold">{sel.name}</h2>
                  <p className="mt-0.5 text-sm text-(--fg-soft) tabular-nums">
                    {sel.born}–{sel.died ?? "present"}
                  </p>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
                  <div className="rounded-lg border border-(--line) bg-(--bg) p-4">
                    {(sel.summary || sel.knownFor).split(/\n\s*\n/).map((p) => (
                      <p
                        key={p.slice(0, 24)}
                        className="mt-3 first:mt-0 text-[0.9375rem] leading-relaxed max-w-prose text-(--fg)"
                      >
                        {p}
                      </p>
                    ))}
                    <Link
                      href={`/economists/${sel.slug}/`}
                      className="mt-4 inline-block rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--bg) hover:opacity-90"
                    >
                      Read the profile →
                    </Link>
                  </div>
                  {sch && (
                    <div className="self-start rounded-lg border border-(--line) bg-(--bg) p-4">
                      <p className="text-xs uppercase tracking-wide font-medium text-(--fg-soft)">
                        School of thought
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="size-3 shrink-0 rounded-full"
                          style={{ background: sch.color }}
                        />
                        <span className="font-display text-xl font-semibold">{sch.label}</span>
                        <span className="text-sm text-(--fg-soft) tabular-nums">
                          {sch.start}–{sch.end >= 2026 ? "today" : sch.end}
                        </span>
                      </div>
                      <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-(--fg)">
                        {sch.blurb.split(/\n\s*\n/)[0]}
                      </p>
                      <Link
                        href={`/schools/${sch.id}/`}
                        className="mt-4 inline-block rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--bg) hover:opacity-90"
                      >
                        About the {sch.label} school →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

      {/* Selected school card */}
      {selSchool && !sel && (
        <div className="mt-4 rounded-xl border border-(--line) bg-(--bg-raised) overflow-hidden hidden sm:block">
          <div aria-hidden="true" className="h-1.5" style={{ background: selSchool.color }} />
          <div className="p-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="font-display text-2xl font-semibold">{selSchool.label}</h2>
              <span className="text-sm text-(--fg-soft) tabular-nums">
                {selSchool.start}–{selSchool.end >= 2026 ? "today" : selSchool.end}
              </span>
            </div>
            <p className="mt-2 text-sm italic text-(--fg-soft)">{selSchool.oneLiner}</p>
            {selSchool.blurb.split(/\n\s*\n/).map((p) => (
              <p key={p.slice(0, 24)} className="mt-3 text-sm leading-relaxed max-w-prose text-(--fg)">
                {p}
              </p>
            ))}
            <Link
              href={`/schools/${selSchool.id}/`}
              className="mt-4 inline-block rounded-md bg-(--accent) px-4 py-2 text-sm font-medium text-(--bg) hover:opacity-90"
            >
              Read the explainer →
            </Link>
          </div>
        </div>
      )}

      {/* Mobile + screen-reader fallback: vertical era list */}
      <div className="sm:hidden mt-4 space-y-8">
        {ERAS.map((era) => {
          const in_era = economists.filter((e) => e.era === era.id);
          if (!in_era.length) return null;
          return (
            <section key={era.id} aria-labelledby={`era-${era.id}`}>
              <h2
                id={`era-${era.id}`}
                className="font-display text-lg font-semibold flex items-center gap-2"
              >
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full"
                  style={{ background: era.color }}
                />
                {era.label}{" "}
                <span className="text-xs font-normal text-(--fg-soft) tabular-nums">
                  {era.start}–{era.end >= 2026 ? "today" : era.end}
                </span>
              </h2>
              <ul className="mt-3 space-y-2">
                {in_era.map((e) => (
                  <li key={e.slug}>
                    <Link
                      href={`/economists/${e.slug}/`}
                      className="block rounded-lg border border-(--line) bg-(--bg-raised) p-3"
                    >
                      <span className="font-medium">{e.name}</span>{" "}
                      <span className="text-xs text-(--fg-soft) tabular-nums">
                        {e.born}–{e.died ?? "present"}
                      </span>
                      <span className="block text-sm text-(--fg-soft) mt-0.5">
                        {e.knownFor}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
