"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ActNav, Explainer, Slider, TextAlternative } from "./InteractiveShell";
import {
  BASE_CAPACITY,
  DROUGHT_MONTH,
  GOODS,
  RUN_MONTHS,
  initialState,
  step,
  fmtMoney,
  type EconomyState,
  type GoodId,
  type PlannerQuotas,
} from "./priceSignalsEngine";

const ACTS = ["You are the market", "You are the planner", "Why it breaks"];
const REPORT_LAG = 2;

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return <svg className="h-8 w-24" aria-hidden="true" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map(
      (v, i) =>
        `${(i / (values.length - 1)) * 96},${30 - ((v - min) / range) * 26 + 2}`,
    )
    .join(" ");
  return (
    <svg viewBox="0 0 96 34" className="h-8 w-24" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
}

function GoodRow({
  id,
  state,
  mode,
  quota,
  onQuota,
  lagged,
}: {
  id: GoodId;
  state: EconomyState;
  mode: "market" | "planner";
  quota?: number;
  onQuota?: (v: number) => void;
  lagged: boolean;
}) {
  const good = GOODS.find((g) => g.id === id)!;
  const st = state.goods[id];

  // In planner mode the user only sees reports from REPORT_LAG months ago.
  const histIdx = lagged
    ? Math.max(0, st.shortageHistory.length - 1 - REPORT_LAG)
    : st.shortageHistory.length - 1;
  const visibleGap = st.shortageHistory[histIdx] ?? 0;
  const shortage = visibleGap > 1;
  const surplus = visibleGap < -1;

  return (
    <div className="rounded-lg border border-(--line) bg-(--bg-raised) p-3">
      <div className="flex items-center gap-2">
        <span aria-hidden="true">{good.emoji}</span>
        <span className="font-medium text-sm">{good.label}</span>
        {mode === "market" ? (
          <span className="ml-auto tabular-nums text-sm font-semibold">
            {fmtMoney(st.price)}
          </span>
        ) : (
          <span className="ml-auto text-xs text-(--fg-soft)">
            price frozen at {fmtMoney(st.price)}
          </span>
        )}
      </div>

      {mode === "market" && (
        <div className="mt-1 flex items-center justify-between">
          <Sparkline values={st.priceHistory} color="var(--accent)" />
          <span
            className={`text-xs font-medium ${
              shortage
                ? "text-(--chart-shortage)"
                : surplus
                  ? "text-(--chart-surplus)"
                  : "text-(--fg-soft)"
            }`}
          >
            {shortage
              ? `short ${Math.round(visibleGap)}`
              : surplus
                ? `unsold ${Math.round(-visibleGap)}`
                : "clearing"}
          </span>
        </div>
      )}

      {mode === "planner" && onQuota !== undefined && quota !== undefined && (
        <div className="mt-2">
          <Slider
            label="Quota"
            value={quota}
            min={0}
            max={Math.round(BASE_CAPACITY[id] * 1.2)}
            step={1}
            onChange={onQuota}
            format={(v) => `${Math.round(v)} units`}
          />
          <p
            className={`mt-1 text-xs font-medium ${
              shortage
                ? "text-(--chart-shortage)"
                : surplus
                  ? "text-(--chart-surplus)"
                  : "text-(--fg-soft)"
            }`}
            aria-live="off"
          >
            {state.month <= REPORT_LAG
              ? "no reports yet"
              : shortage
                ? `report (month ${Math.max(1, state.month - REPORT_LAG)}): SHORTAGE ${Math.round(visibleGap)}`
                : surplus
                  ? `report (month ${Math.max(1, state.month - REPORT_LAG)}): surplus ${Math.round(-visibleGap)}`
                  : `report (month ${Math.max(1, state.month - REPORT_LAG)}): on target`}
          </p>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ title, state, done }: { title: string; state: EconomyState; done: boolean }) {
  return (
    <div className="rounded-lg border border-(--line) bg-(--bg-raised) p-3 text-sm">
      <p className="font-medium">{title}</p>
      <p className="mt-1 tabular-nums">
        Bread lines (unmet needs): <strong>{Math.round(state.shortageScore)}</strong>
      </p>
      <p className="tabular-nums">
        Waste (unsold goods): <strong>{Math.round(state.wasteScore)}</strong>
      </p>
      {done && (
        <p className="mt-1 text-xs text-(--fg-soft)">
          after {state.month} months (lower is better)
        </p>
      )}
    </div>
  );
}

export default function PriceSignals() {
  const [act, setAct] = useState(0);
  const [unlocked, setUnlocked] = useState(0);
  const [market, setMarket] = useState<EconomyState>(initialState);
  const [planned, setPlanned] = useState<EconomyState>(initialState);
  const [quotas, setQuotas] = useState<PlannerQuotas>(() => {
    const q = {} as PlannerQuotas;
    for (const g of GOODS) q[g.id] = Math.round(BASE_CAPACITY[g.id] * 0.95);
    return q;
  });

  const active = act === 0 ? market : planned;
  const mode: "market" | "planner" = act === 0 ? "market" : "planner";
  const done = active.month >= RUN_MONTHS;

  const advance = () => {
    if (act === 0) setMarket((s) => step(s, "market"));
    else setPlanned((s) => step(s, "planner", quotas));
  };

  const goTo = (i: number) => {
    setAct(i);
    setUnlocked((u) => Math.max(u, i));
  };

  const narration = useMemo(() => {
    if (act === 2) {
      return `Market run: ${Math.round(market.shortageScore)} in unmet needs, ${Math.round(
        market.wasteScore,
      )} in waste. Your plan: ${Math.round(planned.shortageScore)} and ${Math.round(
        planned.wasteScore,
      )}. The difference isn't your skill - it's the information you didn't have.`;
    }
    if (act === 0) {
      if (active.month === 0)
        return "Six goods, one small economy. Steel and fuel make machines; wheat and machines make bread. You don't run anything here - just press “Advance a month” and watch the prices work.";
      if (active.month < DROUGHT_MONTH)
        return `Month ${active.month}: prices near their normal levels, everything roughly clearing. Calm before the drought.`;
      if (active.month === DROUGHT_MONTH)
        return "Drought. Wheat capacity just collapsed - and look at the wheat price. No press release, no committee meeting: the number moved, and everyone who touches wheat now knows to economize.";
      if (!done)
        return "Watch the ripple: dear wheat → dear bread → families buy a little less; meanwhile the high price is pulling growers back into wheat. Nobody is in charge of this response. That's Hayek's point: the price carried the knowledge.";
      return "Twelve months in: the shock came and went, and the system healed itself through nothing but price changes. Now try doing this job yourself - go to Act 2.";
    }
    // planner
    if (active.month === 0)
      return "Same economy, same coming drought - but now prices are frozen and YOU set every quota. One catch: your production reports arrive two months late, just like Gosplan's did. Good luck, comrade.";
    if (active.month < DROUGHT_MONTH)
      return `Month ${active.month}: quotas met so far. Remember - whatever your reports say, they're describing two months ago.`;
    if (active.month === DROUGHT_MONTH)
      return "The drought just hit - but your reports won't show it for two months, and no price is allowed to shout it. Keep planning.";
    if (!done)
      return "Shortages surface late, so you overcorrect; the overcorrection surfaces late, so you overcorrect again. Every quota you touch pulls inputs from somewhere else. This isn't you being bad at it - this is the job being impossible without prices.";
    return "Twelve months of planning done. Compare your bread lines and warehouses of unsold goods with Act 1 - then read Act 3 for why this always happens.";
  }, [act, active.month, done, market.shortageScore, market.wasteScore, planned.shortageScore, planned.wasteScore]);

  return (
    <div className="space-y-5">
      <ActNav acts={ACTS} current={act} onSelect={goTo} unlocked={unlocked} />

      <Explainer>
        <p>{narration}</p>
      </Explainer>

      {act < 2 ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              {GOODS.map((g) => (
                <GoodRow
                  key={g.id}
                  id={g.id}
                  state={active}
                  mode={mode}
                  quota={quotas[g.id]}
                  onQuota={(v) => setQuotas((q) => ({ ...q, [g.id]: v }))}
                  lagged={mode === "planner"}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={advance}
              disabled={done}
              className="w-full rounded-full bg-(--accent) px-5 py-2.5 text-sm font-medium text-(--bg) hover:opacity-90 disabled:opacity-40"
            >
              {done
                ? "Year complete"
                : `Advance a month (${active.month}/${RUN_MONTHS})`}
            </button>

            <ScoreCard
              title={mode === "market" ? "Market scorecard" : "Your plan's scorecard"}
              state={active}
              done={done}
            />

            {active.log.length > 0 && (
              <div
                className="rounded-lg border border-(--line) bg-(--bg-raised) p-3 text-xs space-y-1.5 max-h-48 overflow-y-auto"
                aria-label="Event log"
              >
                {active.log.map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
              </div>
            )}

            {done && act < 2 && (
              <button
                onClick={() => goTo(act + 1)}
                className="w-full rounded-full border border-(--accent) px-5 py-2.5 text-sm font-medium text-(--accent) hover:bg-(--accent-soft)"
              >
                Next: {ACTS[act + 1]} →
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="prose">
            <h3>The calculation problem</h3>
            <p>
              In Act 2, you could see six numbers and still couldn&apos;t steer. Now
              imagine twenty million products. Ludwig von Mises&apos;s 1920 argument
              was exactly this: without market prices for machines, steel, and fuel,
              a planner has <em>no common unit</em> to compare alternatives. Should
              scarce steel go to tractors or shoe factories? With prices, the
              cheaper path announces itself. Without them, it&apos;s guesswork with a
              ruler that has no markings.
            </p>
            <h3>The knowledge problem</h3>
            <p>
              Friedrich Hayek added the deeper twist you felt in the report delays:
              the information a planner needs - this field flooded, that machine
              broke, families here would happily eat rye instead - never exists in
              one place. It lives in millions of heads, and most of it can&apos;t
              even be written down in time to matter. In Act 1, nobody reported
              anything; the wheat price simply rose, and everyone adjusted. The
              price <em>was</em> the report.
            </p>
            <h3>What history says</h3>
            <p>
              Real planned economies ran this experiment at scale. Soviet Gosplan
              balanced thousands of materials by hand and still lurched between
              queues for bread and warehouses of unwanted goods. To be fair, planning
              had real successes - crash industrialization in the 1930s, wartime
              mobilization - and they fit the theory: few goods, one overriding goal.
              The failures came where the calculation problem bites hardest: a whole
              consumer economy, millions of goods, no prices to think with.
            </p>
            <p>
              This module critiques a <em>mechanism</em>, not the people who hoped it
              would work - and the conversation has another side. Read the{" "}
              <Link href="/economists/karl-marx/">Karl Marx profile</Link> for the
              steelmanned case that motivated planning, and{" "}
              <Link href="/economists/friedrich-hayek/">Hayek</Link> and{" "}
              <Link href="/economists/ludwig-von-mises/">Mises</Link> for the full
              reply.
            </p>
          </div>
          <div className="space-y-4">
            <ScoreCard title="Act 1 - the market" state={market} done={market.month >= RUN_MONTHS} />
            <ScoreCard title="Act 2 - your plan" state={planned} done={planned.month >= RUN_MONTHS} />
            <button
              onClick={() => {
                setMarket(initialState());
                setPlanned(initialState());
                setAct(0);
              }}
              className="w-full rounded-full border border-(--line) px-5 py-2.5 text-sm font-medium hover:border-(--accent)"
            >
              Run it all again
            </button>
          </div>
        </div>
      )}

      <TextAlternative>
        <p>
          This interactive demonstrates why prices matter for coordinating an
          economy, in three acts. Act 1 simulates a six-good market economy (wheat,
          steel, fuel, machines, bread, shoes, with realistic supply chains). In
          month {DROUGHT_MONTH} a drought halves wheat capacity. With floating
          prices, the wheat price roughly doubles within a month; bread gets more
          expensive; households buy somewhat less bread (economizing without being
          told about any drought); and high prices draw producers back into wheat,
          so supply largely recovers within the year. Total unmet demand stays
          small.
        </p>
        <p>
          Act 2 replays the identical economy and drought, but prices are frozen and
          you set production quotas by hand - with reports that arrive two months
          late, as they did in real planned economies. Because no price signals the
          shortage, and every correction diverts inputs from other goods, users
          typically end the year with several times the market&apos;s unmet demand
          plus warehouses of surplus goods. Act 3 explains the two underlying
          arguments: Mises&apos;s calculation problem (without prices there is no
          common unit to compare production alternatives) and Hayek&apos;s knowledge
          problem (the needed information is dispersed and never available to one
          mind in time), with honest historical context on where planning did and
          didn&apos;t work.
        </p>
      </TextAlternative>
    </div>
  );
}
