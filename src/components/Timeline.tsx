"use client";

import { useMemo, useRef, useState } from "react";
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
  flagship: boolean;
  influencedBy: string[];
  arguedAgainst: string[];
};

const YEAR_MIN = 1550;
const YEAR_MAX = 2026;
const ROW_H = 30;
const BAND_H = 16;

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
  const [domain, setDomain] = useState<[number, number]>([YEAR_MIN, YEAR_MAX]);
  const [layers, setLayers] = useState<Layers>({ schools: true, world: true, tax: false });
  const [selected, setSelected] = useState<string | null>(null);
  const dragging = useRef<{ startX: number; startDomain: [number, number] } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 960;
  const M = { left: 16, right: 16, top: 28, bottom: 8 };

  const lanes = useMemo(() => packLanes(economists), [economists]);
  const laneCount = Math.max(...[...lanes.values()], 0) + 1;

  const schoolRows = layers.schools ? SCHOOLS.length : 0;
  const eventsH = layers.world || layers.tax ? 64 : 0;
  const H =
    M.top + laneCount * ROW_H + 12 + schoolRows * (BAND_H + 4) + eventsH + M.bottom;

  const x = scaleLinear().domain(domain).range([M.left, W - M.right]);

  const clampDomain = (d: [number, number]): [number, number] => {
    let a = d[0];
    const b = d[1];
    const span = Math.max(30, Math.min(YEAR_MAX - YEAR_MIN, b - a));
    a = Math.max(YEAR_MIN, Math.min(a, YEAR_MAX - span));
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
  const byLane = (slug: string) => M.top + (lanes.get(slug) ?? 0) * ROW_H;

  const connections =
    sel &&
    [
      ...sel.influencedBy.map((t) => ({ to: t, kind: "influenced by" as const })),
      ...sel.arguedAgainst.map((t) => ({ to: t, kind: "argued against" as const })),
    ].filter((c) => economists.some((e) => e.slug === c.to));

  const events = [
    ...(layers.world ? eventsData.world.map((e) => ({ ...e, layer: "world" })) : []),
    ...(layers.tax ? eventsData.tax.map((e) => ({ ...e, layer: "tax" })) : []),
  ].filter((e) => e.year >= domain[0] && e.year <= domain[1]);

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
            onClick={() => setDomain([YEAR_MIN, YEAR_MAX])}
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
            const y1 = byLane(from.slug) + 10;
            const x2 = x((to.born + (to.died ?? YEAR_MAX)) / 2);
            const y2 = byLane(to.slug) + 10;
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

          {/* Economist lifespan bars */}
          {economists.map((e) => {
            const died = e.died ?? YEAR_MAX;
            if (died < domain[0] || e.born > domain[1]) return null;
            const bx = Math.max(x(e.born), M.left);
            const bw = Math.max(6, Math.min(x(died), W - M.right) - bx);
            const by = byLane(e.slug);
            const color = SCHOOL_MAP[e.school]?.color ?? "var(--accent)";
            const isSel = selected === e.slug;
            return (
              <g
                key={e.slug}
                onClick={() => setSelected(isSel ? null : e.slug)}
                className="cursor-pointer"
              >
                <rect
                  x={bx}
                  y={by + 4}
                  width={bw}
                  height={12}
                  rx={6}
                  fill={color}
                  opacity={isSel ? 1 : 0.75}
                  stroke={isSel ? "var(--fg)" : "none"}
                  strokeWidth={1.5}
                >
                  <title>{`${e.name} (${e.born}–${e.died ?? ""}): ${e.knownFor}`}</title>
                </rect>
                {bw > 60 && (
                  <text
                    x={bx + 6}
                    y={by + 13.5}
                    fontSize={10}
                    fontWeight={e.flagship ? 700 : 500}
                    fill="var(--bg)"
                    pointerEvents="none"
                  >
                    {/* fall back to surname when the full name overflows the bar */}
                    {e.name.length * 6.2 < bw - 10
                      ? e.name
                      : e.name.split(" ").slice(-1)[0]}
                  </text>
                )}
              </g>
            );
          })}

          {/* School bands */}
          {layers.schools &&
            SCHOOLS.map((s, i) => {
              const y0 = M.top + laneCount * ROW_H + 12 + i * (BAND_H + 4);
              const x0 = Math.max(x(s.start), M.left);
              const x1 = Math.min(x(s.end), W - M.right);
              if (x1 <= x0) return null;
              return (
                <g key={s.id}>
                  <rect
                    x={x0}
                    y={y0}
                    width={x1 - x0}
                    height={BAND_H}
                    rx={4}
                    fill={s.color}
                    opacity={0.35}
                  >
                    <title>{`${s.label} (${s.start}–${s.end >= 2026 ? "today" : s.end}): ${s.oneLiner}`}</title>
                  </rect>
                  {x1 - x0 > 80 && (
                    <text
                      x={x0 + 5}
                      y={y0 + 12}
                      fontSize={9.5}
                      fill="var(--fg)"
                    >
                      {s.label}
                    </text>
                  )}
                </g>
              );
            })}

          {/* Event markers — labels drop out where they'd collide; the dot
              keeps a native tooltip either way. */}
          {(() => {
            const rowEnd = [M.left, M.left, M.left];
            return events
              .sort((a, b) => a.year - b.year)
              .map((ev, i) => {
                const row = i % 3;
                const y0 = H - M.bottom - eventsH + 8 + row * 19;
                const cx = x(ev.year);
                const label = `${ev.year} ${
                  ev.label.length > 26 ? ev.label.slice(0, 24) + "…" : ev.label
                }`;
                const fits = cx + 7 > rowEnd[row];
                if (fits) rowEnd[row] = cx + 7 + label.length * 5.4;
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
                      <title>{`${ev.year} — ${ev.label}: ${ev.note}`}</title>
                    </circle>
                    {fits && (
                      <text x={cx + 7} y={y0 + 3.5} fontSize={9.5} fill="var(--fg-soft)">
                        {label}
                      </text>
                    )}
                  </g>
                );
              });
          })()}
        </svg>
        <p className="px-2 pb-1 text-xs text-(--fg-soft)">
          Drag to pan · Ctrl+scroll or buttons to zoom · click a bar for details and
          influence arrows
        </p>
      </div>

      {/* Selected card */}
      {sel && (
        <div className="mt-4 rounded-xl border border-(--accent) bg-(--accent-soft) p-4 hidden sm:block">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h2 className="font-display text-xl font-semibold">{sel.name}</h2>
            <span className="text-sm text-(--fg-soft) tabular-nums">
              {sel.born}–{sel.died ?? "present"}
            </span>
            <Link
              href={`/economists/${sel.slug}/`}
              className="ml-auto text-sm font-medium text-(--accent) underline"
            >
              Read the profile →
            </Link>
          </div>
          <p className="mt-1 text-sm">{sel.knownFor}</p>
          {connections && connections.length > 0 && (
            <p className="mt-2 text-xs text-(--fg-soft)">
              Arrows: solid = influenced by, dashed red = argued against.
            </p>
          )}
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
