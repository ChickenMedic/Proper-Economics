"use client";

import { useEffect, useRef, useState } from "react";
import { scaleLinear } from "d3-scale";
import { ActNav, Explainer, Slider, TextAlternative } from "./InteractiveShell";

/**
 * The toy market: coffee at a street stall.
 *   Demand: Qd = 100 - 10P (+ shift)     Supply: Qs = 12P - 10 (+ shift)
 * Base equilibrium: P = $5, Q = 50 cups/day.
 */
const P_MIN = 1;
const P_MAX = 10;
const Q_MAX = 120;

const qd = (p: number, shift = 0) => Math.max(0, 100 - 10 * p + shift);
const qs = (p: number, shift = 0) => Math.max(0, 12 * p - 10 + shift);
const eqPrice = (ds: number, ss: number) =>
  Math.min(P_MAX, Math.max(P_MIN, (110 + ds - ss) / 22));

const money = (v: number) => `$${v.toFixed(2)}`;

const ACTS = ["Demand", "Supply", "Equilibrium", "Shocks", "Interventions", "Sandbox"];

type Scenario = "none" | "frost" | "health";

const W = 640;
const H = 420;
const M = { top: 20, right: 90, bottom: 48, left: 56 };

function Chart({
  price,
  demandShift,
  supplyShift,
  showDemand,
  showSupply,
  showShiftGhosts,
  controlledLabel,
}: {
  price: number;
  demandShift: number;
  supplyShift: number;
  showDemand: boolean;
  showSupply: boolean;
  showShiftGhosts: boolean;
  controlledLabel?: string;
}) {
  const x = scaleLinear().domain([0, Q_MAX]).range([M.left, W - M.right]);
  const y = scaleLinear().domain([P_MIN, P_MAX]).range([H - M.bottom, M.top]);

  const line = (f: (p: number) => number) => {
    const pts: string[] = [];
    for (let p = P_MIN; p <= P_MAX + 1e-9; p += 0.25) {
      pts.push(`${x(Math.min(Q_MAX, f(p)))},${y(p)}`);
    }
    return pts.join(" ");
  };

  const Qd = qd(price, demandShift);
  const Qs = qs(price, supplyShift);
  const gap = Qs - Qd; // >0 surplus, <0 shortage
  const showBoth = showDemand && showSupply;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Supply and demand chart for coffee. At ${money(price)} per cup, buyers want ${Math.round(
        Qd,
      )} cups and sellers offer ${Math.round(Qs)} cups.`}
      className="w-full h-auto select-none"
    >
      {/* grid */}
      {y.ticks(5).map((t) => (
        <line
          key={`gy${t}`}
          x1={M.left}
          x2={W - M.right}
          y1={y(t)}
          y2={y(t)}
          stroke="var(--line)"
          strokeWidth={1}
        />
      ))}

      {/* axes */}
      <line
        x1={M.left}
        x2={M.left}
        y1={M.top}
        y2={H - M.bottom}
        stroke="var(--fg-soft)"
        strokeWidth={1}
      />
      <line
        x1={M.left}
        x2={W - M.right}
        y1={H - M.bottom}
        y2={H - M.bottom}
        stroke="var(--fg-soft)"
        strokeWidth={1}
      />
      {y.ticks(5).map((t) => (
        <text
          key={`ty${t}`}
          x={M.left - 8}
          y={y(t)}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize={12}
          fill="var(--fg-soft)"
        >
          ${t}
        </text>
      ))}
      {x.ticks(6).map((t) => (
        <text
          key={`tx${t}`}
          x={x(t)}
          y={H - M.bottom + 18}
          textAnchor="middle"
          fontSize={12}
          fill="var(--fg-soft)"
        >
          {t}
        </text>
      ))}
      <text
        x={M.left}
        y={M.top - 6}
        fontSize={12}
        fill="var(--fg-soft)"
        textAnchor="start"
      >
        Price per cup
      </text>
      <text
        x={W - M.right}
        y={H - 8}
        fontSize={12}
        fill="var(--fg-soft)"
        textAnchor="end"
      >
        Cups per day
      </text>

      {/* ghost (pre-shift) curves */}
      {showShiftGhosts && demandShift !== 0 && (
        <polyline
          points={line((p) => qd(p))}
          fill="none"
          stroke="var(--chart-demand)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.4}
        />
      )}
      {showShiftGhosts && supplyShift !== 0 && (
        <polyline
          points={line((p) => qs(p))}
          fill="none"
          stroke="var(--chart-supply)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.4}
        />
      )}

      {/* curves + direct labels */}
      {showDemand && (
        <>
          <polyline
            points={line((p) => qd(p, demandShift))}
            fill="none"
            stroke="var(--chart-demand)"
            strokeWidth={2.5}
          />
          <text
            x={x(Math.min(Q_MAX, qd(P_MIN, demandShift))) + 6}
            y={y(P_MIN) - 6}
            fontSize={13}
            fontWeight={600}
            fill="var(--chart-demand)"
          >
            Demand
          </text>
        </>
      )}
      {showSupply && (
        <>
          <polyline
            points={line((p) => qs(p, supplyShift))}
            fill="none"
            stroke="var(--chart-supply)"
            strokeWidth={2.5}
          />
          <text
            x={x(Math.min(Q_MAX, qs(P_MAX, supplyShift))) + 6}
            y={y(P_MAX) + 4}
            fontSize={13}
            fontWeight={600}
            fill="var(--chart-supply)"
          >
            Supply
          </text>
        </>
      )}

      {/* shortage / surplus bar between the curves at the current price */}
      {showBoth && Math.abs(gap) > 1.5 && (
        <>
          <line
            x1={x(Math.min(Qd, Qs))}
            x2={x(Math.max(Qd, Qs))}
            y1={y(price)}
            y2={y(price)}
            stroke={gap < 0 ? "var(--chart-shortage)" : "var(--chart-surplus)"}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.8}
          />
          <text
            x={x((Qd + Qs) / 2)}
            y={y(price) - 10}
            textAnchor="middle"
            fontSize={12}
            fontWeight={600}
            fill={gap < 0 ? "var(--chart-shortage)" : "var(--chart-surplus)"}
          >
            {gap < 0
              ? `Shortage: ${Math.round(-gap)} cups`
              : `Surplus: ${Math.round(gap)} cups`}
          </text>
        </>
      )}

      {/* price line */}
      <line
        x1={M.left}
        x2={W - M.right}
        y1={y(price)}
        y2={y(price)}
        stroke="var(--fg)"
        strokeWidth={1.5}
        strokeDasharray="6 3"
      />
      <text
        x={W - M.right + 6}
        y={y(price)}
        dominantBaseline="middle"
        fontSize={12.5}
        fontWeight={600}
        fill="var(--fg)"
      >
        {controlledLabel ? `${controlledLabel} ${money(price)}` : money(price)}
      </text>

      {/* markers on the curves at the current price */}
      {showDemand && (
        <circle cx={x(Qd)} cy={y(price)} r={5} fill="var(--chart-demand)" stroke="var(--bg)" strokeWidth={2} />
      )}
      {showSupply && (
        <circle cx={x(Qs)} cy={y(price)} r={5} fill="var(--chart-supply)" stroke="var(--bg)" strokeWidth={2} />
      )}
    </svg>
  );
}

export default function SupplyDemand() {
  const [act, setAct] = useState(0);
  const [unlocked, setUnlocked] = useState(0);
  const [price, setPrice] = useState(7);
  const [scenario, setScenario] = useState<Scenario>("none");
  const [control, setControl] = useState<"none" | "ceiling" | "floor">("none");
  const [releasing, setReleasing] = useState(false);
  const raf = useRef<number | null>(null);

  const demandShift = scenario === "health" ? 30 : 0;
  const supplyShift = scenario === "frost" ? -30 : 0;
  const pEq = eqPrice(demandShift, supplyShift);
  const qEq = qd(pEq, demandShift);
  const Qd = qd(price, demandShift);
  const Qs = qs(price, supplyShift);
  const gap = Qs - Qd;

  const goTo = (i: number) => {
    setAct(i);
    setUnlocked((u) => Math.max(u, i));
    setReleasing(false);
    if (i <= 2) {
      setScenario("none");
      setControl("none");
    }
    if (i === 3) setControl("none");
  };

  // "Let the price go" animation: drift toward equilibrium.
  useEffect(() => {
    if (!releasing) return;
    const tick = () => {
      setPrice((p) => {
        const next = p + (pEq - p) * 0.06;
        if (Math.abs(next - pEq) < 0.01) {
          setReleasing(false);
          return pEq;
        }
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [releasing, pEq]);

  const narration = (): string => {
    const p = money(price);
    switch (act) {
      case 0:
        if (price >= 8)
          return `At ${p} a cup, only the die-hards are buying - about ${Math.round(Qd)} cups a day. Slide the price down and watch new buyers appear.`;
        if (price <= 3)
          return `At ${p}, coffee is nearly a public utility: around ${Math.round(Qd)} cups a day. Cheaper price, more takers - that's the whole demand curve in one move.`;
        return `At ${p} a cup, about ${Math.round(Qd)} people buy one each day. Lower the price and more say yes; raise it and they drop away. That downward slope is demand.`;
      case 1:
        if (price >= 8)
          return `At ${p} a cup, everyone with an espresso machine wants in - sellers would pour about ${Math.round(Qs)} cups. High prices coax more supply out of the woodwork.`;
        if (price <= 3)
          return `At ${p}, hardly anyone can cover their beans and rent: only ${Math.round(Qs)} cups get made. Low prices push sellers out.`;
        return `At ${p} a cup, sellers offer about ${Math.round(Qs)} cups a day. The higher the price, the more it's worth someone's while to sell - that's the upward slope of supply.`;
      case 2:
        if (gap < -2)
          return `At ${p}, buyers want ${Math.round(Qd)} cups but sellers only offer ${Math.round(Qs)} - a shortage of ${Math.round(-gap)}. The queue forms, and frustrated buyers bid the price up. Press "Let the price go" and watch.`;
        if (gap > 2)
          return `At ${p}, sellers pour ${Math.round(Qs)} cups but only ${Math.round(Qd)} sell - a surplus of ${Math.round(gap)}. Unsold coffee pushes the price down. Press "Let the price go" and watch.`;
        return `Right around ${money(pEq)}, the two curves cross: about ${Math.round(qEq)} cups, no queue, no waste. Here's the quietly amazing part - nobody set this price. It found itself.`;
      case 3:
        if (scenario === "none")
          return `Pick a shock. Before you click: which curve will move, and which way will the price go?`;
        if (scenario === "frost")
          return `Frost wiped out part of the harvest - at every price, fewer cups can be made, so the whole supply curve slid left. The new crossing point: about ${money(pEq)} and ${Math.round(qEq)} cups. Scarcer coffee, pricier coffee - automatically.`;
        return `Word spreads that coffee is good for you - at every price, more people want a cup, so demand slid right. The new equilibrium: about ${money(pEq)} and ${Math.round(qEq)} cups. More demand met by more supply, coaxed out by the higher price.`;
      case 4:
        if (control === "none")
          return `Now play government. Cap the price (a ceiling, like rent control) or prop it up (a floor, like a minimum wage) - and see what the market can't do anymore.`;
        if (control === "ceiling")
          return gap < -2
            ? `With the price capped at ${p}, buyers want ${Math.round(Qd)} cups but sellers will only make ${Math.round(Qs)}. The shortage - ${Math.round(-gap)} cups - doesn't clear, because the price isn't allowed to rise. This queue is permanent.`
            : `Your ceiling is above the market price, so it doesn't bind - the market still clears on its own. Push it below ${money(pEq)} to see it bite.`;
        return gap > 2
          ? `With the price propped at ${p}, sellers pour ${Math.round(Qs)} cups but buyers take only ${Math.round(Qd)}. The surplus - ${Math.round(gap)} cups - piles up every day, because the price isn't allowed to fall.`
          : `Your floor is below the market price, so it doesn't bind. Push it above ${money(pEq)} to see the surplus appear.`;
      default:
        return `Everything is unlocked: shocks, controls, the price itself. Break the market, fix it, break it again - that's the fastest way to make the diagram permanent in your head.`;
    }
  };

  const btn =
    "rounded-full border border-(--line) bg-(--bg-raised) px-3.5 py-1.5 text-sm font-medium hover:border-(--accent) transition-colors";
  const btnActive = "rounded-full border px-3.5 py-1.5 text-sm font-medium bg-(--accent) text-(--bg) border-(--accent)";

  const showDemand = act !== 1;
  const showSupply = act !== 0;

  return (
    <div className="space-y-5">
      <ActNav acts={ACTS} current={act} onSelect={goTo} unlocked={unlocked} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="rounded-xl border border-(--line) bg-(--bg-raised) p-4">
          <Chart
            price={price}
            demandShift={demandShift}
            supplyShift={supplyShift}
            showDemand={showDemand}
            showSupply={showSupply}
            showShiftGhosts={act >= 3}
            controlledLabel={
              control === "ceiling" ? "Ceiling" : control === "floor" ? "Floor" : undefined
            }
          />
        </div>

        <div className="space-y-5">
          <Explainer>
            <p>{narration()}</p>
          </Explainer>

          <div className="space-y-4 rounded-xl border border-(--line) bg-(--bg-raised) p-4">
            <Slider
              label={
                control === "ceiling"
                  ? "Price ceiling"
                  : control === "floor"
                    ? "Price floor"
                    : "Price of a cup"
              }
              value={price}
              min={P_MIN}
              max={P_MAX}
              step={0.25}
              onChange={(v) => {
                setReleasing(false);
                setPrice(v);
              }}
              format={money}
            />

            {(act === 2 || act === 5) && (
              <button
                className={btn}
                onClick={() => setReleasing(true)}
                disabled={releasing}
              >
                {releasing ? "Finding its level…" : "Let the price go"}
              </button>
            )}

            {(act === 3 || act === 5) && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Shocks">
                <button
                  className={scenario === "frost" ? btnActive : btn}
                  onClick={() => setScenario(scenario === "frost" ? "none" : "frost")}
                >
                  ❄ Frost hits the harvest
                </button>
                <button
                  className={scenario === "health" ? btnActive : btn}
                  onClick={() => setScenario(scenario === "health" ? "none" : "health")}
                >
                  ☕ &ldquo;Coffee is healthy!&rdquo;
                </button>
              </div>
            )}

            {(act === 4 || act === 5) && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Price controls">
                <button
                  className={control === "ceiling" ? btnActive : btn}
                  onClick={() => {
                    setControl(control === "ceiling" ? "none" : "ceiling");
                    setPrice(3.5);
                  }}
                >
                  Impose a ceiling
                </button>
                <button
                  className={control === "floor" ? btnActive : btn}
                  onClick={() => {
                    setControl(control === "floor" ? "none" : "floor");
                    setPrice(7);
                  }}
                >
                  Impose a floor
                </button>
              </div>
            )}
          </div>

          {act < ACTS.length - 1 && (
            <button
              onClick={() => goTo(act + 1)}
              className="w-full rounded-full bg-(--accent) px-5 py-2.5 text-sm font-medium text-(--bg) hover:opacity-90"
            >
              Next: {ACTS[act + 1]} →
            </button>
          )}
        </div>
      </div>

      <TextAlternative>
        <p>
          This interactive demonstrates how prices coordinate a market, using coffee
          as the example. A demand curve slopes down (at $2 a cup about 80 people
          buy daily; at $8, about 20). A supply curve slopes up (at $2 sellers offer
          about 14 cups; at $8, about 86). Where they cross - about $5 and 50 cups - 
          the market clears: everyone willing to pay the price gets a cup, and no
          coffee goes unsold. No one chose $5; it emerges from buyers and sellers
          reacting to each other.
        </p>
        <p>
          If the price sits above $5, sellers brew more than buyers take, and the
          unsold surplus pushes the price down. Below $5, buyers queue for scarce
          cups and bid the price up. A frost that destroys harvest shifts supply
          left: the new crossing point has a higher price and fewer cups. News that
          coffee is healthy shifts demand right: more cups at a higher price. A
          legal price ceiling below $5 creates a permanent shortage (the queue never
          clears); a floor above $5 creates a permanent surplus (coffee poured out
          every night). Rent control and minimum wages are the classic real-world
          debates over exactly these trade-offs - with reasonable economists
          disagreeing about how large the effects are in each market.
        </p>
      </TextAlternative>
    </div>
  );
}
