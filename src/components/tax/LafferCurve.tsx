"use client";

import { useState } from "react";
import { scaleLinear } from "d3-scale";
import { Slider } from "@/components/interactives/InteractiveShell";

/**
 * Stylized Laffer curve with an honest uncertainty band. Each curve is
 * revenue(r) = r·(1−r)^k, normalized; the peak sits at 1/(1+k). We shade the
 * whole family with peaks between ~45% and ~75% — roughly the span of serious
 * empirical estimates — rather than pretending the peak is known.
 */
const PEAK_LOW = 0.45;
const PEAK_HIGH = 0.75;

const kFor = (peak: number) => (1 - peak) / peak;

function revenue(rate: number, peak: number): number {
  const k = kFor(peak);
  const raw = rate * Math.pow(1 - rate, k);
  const max = peak * Math.pow(1 - peak, k);
  return raw / max; // normalized so every curve peaks at 1
}

const W = 640;
const H = 360;
const M = { top: 24, right: 24, bottom: 44, left: 52 };

export default function LafferCurve() {
  const [rate, setRate] = useState(35);

  const x = scaleLinear().domain([0, 100]).range([M.left, W - M.right]);
  const y = scaleLinear().domain([0, 1.05]).range([H - M.bottom, M.top]);

  const path = (peak: number) => {
    const pts: string[] = [];
    for (let r = 0; r <= 100; r += 1) {
      pts.push(`${x(r)},${y(revenue(r / 100, peak))}`);
    }
    return pts.join(" ");
  };

  // Shaded band between the two extreme curves.
  const bandPoints = (() => {
    const upper: string[] = [];
    const lower: string[] = [];
    for (let r = 0; r <= 100; r += 1) {
      const vals = [revenue(r / 100, PEAK_LOW), revenue(r / 100, PEAK_HIGH)];
      upper.push(`${x(r)},${y(Math.max(...vals))}`);
      lower.unshift(`${x(r)},${y(Math.min(...vals))}`);
    }
    return [...upper, ...lower].join(" ");
  })();

  const rLow = revenue(rate / 100, PEAK_LOW);
  const rHigh = revenue(rate / 100, PEAK_HIGH);
  const lo = Math.min(rLow, rHigh);
  const hi = Math.max(rLow, rHigh);

  const verdict =
    rate <= 40
      ? "At this rate, every serious estimate agrees: raising the rate raises revenue (though it may still slow growth — that's a separate argument)."
      : rate <= 75
        ? "You're now inside the disputed zone. Under some estimates a higher rate still raises revenue; under others you've passed the peak and it loses money. This is exactly where the empirical fight happens."
        : "Almost every estimate puts you past the peak here: the rate is so high that shrinking activity and avoidance outweigh the higher take.";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="rounded-xl border border-(--line) bg-(--bg-raised) p-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Stylized Laffer curve. At a ${rate}% tax rate, relative revenue is between ${Math.round(lo * 100)} and ${Math.round(hi * 100)} percent of the theoretical maximum, depending on where the disputed peak lies.`}
          className="w-full h-auto select-none"
        >
          {/* axes */}
          <line x1={M.left} x2={M.left} y1={M.top} y2={H - M.bottom} stroke="var(--fg-soft)" strokeWidth={1} />
          <line x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} stroke="var(--fg-soft)" strokeWidth={1} />
          {[0, 25, 50, 75, 100].map((t) => (
            <text key={t} x={x(t)} y={H - M.bottom + 18} textAnchor="middle" fontSize={12} fill="var(--fg-soft)">
              {t}%
            </text>
          ))}
          <text x={W - M.right} y={H - 6} textAnchor="end" fontSize={12} fill="var(--fg-soft)">
            Tax rate
          </text>
          <text x={M.left} y={M.top - 8} fontSize={12} fill="var(--fg-soft)">
            Revenue (relative)
          </text>

          {/* uncertainty band + boundary curves */}
          <polygon points={bandPoints} fill="var(--accent)" opacity={0.15} />
          <polyline points={path(PEAK_LOW)} fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="5 4" />
          <polyline points={path(PEAK_HIGH)} fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="5 4" />
          <text x={x(PEAK_LOW * 100)} y={y(1) - 8} textAnchor="middle" fontSize={11} fill="var(--accent)">
            peak if {Math.round(PEAK_LOW * 100)}%
          </text>
          <text x={x(PEAK_HIGH * 100)} y={y(1) - 8} textAnchor="middle" fontSize={11} fill="var(--accent)">
            peak if {Math.round(PEAK_HIGH * 100)}%
          </text>

          {/* your rate */}
          <line x1={x(rate)} x2={x(rate)} y1={M.top} y2={H - M.bottom} stroke="var(--fg)" strokeWidth={1.5} strokeDasharray="6 3" />
          <line x1={x(rate)} x2={x(rate)} y1={y(hi)} y2={y(lo)} stroke="var(--fg)" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
          <text x={x(rate)} y={M.top + 12} textAnchor={rate > 85 ? "end" : "start"} dx={rate > 85 ? -6 : 6} fontSize={12.5} fontWeight={600} fill="var(--fg)">
            your rate: {rate}%
          </text>
        </svg>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-(--line) bg-(--bg-raised) p-4">
          <Slider label="Tax rate" value={rate} min={0} max={100} step={1} onChange={setRate} format={(v) => `${v}%`} />
        </div>
        <div aria-live="polite" className="rounded-xl border border-(--accent) bg-(--accent-soft) p-4 text-sm leading-relaxed">
          <p className="text-xs uppercase tracking-wide font-medium text-(--accent) mb-1">
            What just happened?
          </p>
          <p>{verdict}</p>
        </div>
        <p className="text-xs text-(--fg-soft)">
          The logic is solid at the endpoints — 0% raises nothing, 100% raises
          nothing because no one works — but the location of the peak is{" "}
          <strong>empirically disputed</strong>: published estimates for top-rate
          revenue-maximization run from around 45% to over 75%, varying by country,
          tax base, and how easily the taxed can move or avoid. Anyone who draws
          this curve with one confident hump is selling something.
        </p>
      </div>
    </div>
  );
}
