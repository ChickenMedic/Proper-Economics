/**
 * Toy six-good economy for the calculation-problem interactive.
 * Deliberately simplified: the point is the *information flow*, not realism.
 *
 * Supply chains: steel + fuel → machines; wheat + machines → bread;
 * steel + machines → shoes. Consumers buy bread, shoes, and fuel.
 *
 * Design constraints that keep the dynamics stable (and the lesson honest):
 *  - scarce inputs are rationed *proportionally* among users, so no good is
 *    starved by evaluation order;
 *  - capacity mean-reverts toward a price-driven target (bounded), so the
 *    market response is damped rather than explosive;
 *  - scores count consumers only (unmet needs + unsold consumer goods), the
 *    same metric in both modes.
 */

export type GoodId = "wheat" | "steel" | "fuel" | "machines" | "bread" | "shoes";

export const GOODS: { id: GoodId; label: string; emoji: string; consumer: boolean }[] = [
  { id: "wheat", label: "Wheat", emoji: "🌾", consumer: false },
  { id: "steel", label: "Steel", emoji: "🔩", consumer: false },
  { id: "fuel", label: "Fuel", emoji: "🛢️", consumer: true },
  { id: "machines", label: "Machines", emoji: "⚙️", consumer: false },
  { id: "bread", label: "Bread", emoji: "🍞", consumer: true },
  { id: "shoes", label: "Shoes", emoji: "👞", consumer: true },
];

// inputs per unit of output
export const RECIPES: Record<GoodId, Partial<Record<GoodId, number>>> = {
  wheat: {},
  steel: {},
  fuel: {},
  machines: { steel: 1, fuel: 1 },
  bread: { wheat: 2, machines: 0.2 },
  shoes: { steel: 0.5, machines: 0.3 },
};

export const REF_PRICE: Record<GoodId, number> = {
  wheat: 2,
  steel: 5,
  fuel: 4,
  machines: 20,
  bread: 3,
  shoes: 25,
};

// household demand at reference prices
export const BASE_DEMAND: Record<GoodId, number> = {
  wheat: 0,
  steel: 0,
  fuel: 50,
  machines: 0,
  bread: 100,
  shoes: 40,
};

// calibrated so the pre-drought economy roughly clears
export const BASE_CAPACITY: Record<GoodId, number> = {
  wheat: 215,
  steel: 56,
  fuel: 86,
  machines: 34,
  bread: 104,
  shoes: 42,
};

export type GoodState = {
  price: number;
  capacity: number;
  produced: number;
  demanded: number;
  priceHistory: number[];
  shortageHistory: number[]; // demanded - supplied (>0 shortage)
};

export type EconomyState = {
  month: number;
  drought: boolean;
  goods: Record<GoodId, GoodState>;
  shortageScore: number; // cumulative unmet household demand, at ref prices
  wasteScore: number; // cumulative unsold household goods, at ref prices
  log: string[];
};

export const DROUGHT_MONTH = 3;
export const RUN_MONTHS = 12;

export function initialState(): EconomyState {
  const goods = {} as Record<GoodId, GoodState>;
  for (const g of GOODS) {
    goods[g.id] = {
      price: REF_PRICE[g.id],
      capacity: BASE_CAPACITY[g.id],
      produced: 0,
      demanded: 0,
      priceHistory: [REF_PRICE[g.id]],
      shortageHistory: [0],
    };
  }
  return {
    month: 0,
    drought: false,
    goods,
    shortageScore: 0,
    wasteScore: 0,
    log: [],
  };
}

/** Household demand responds to price in market mode (elasticity 0.7). */
function householdDemand(id: GoodId, price: number, pricesFloat: boolean): number {
  const base = BASE_DEMAND[id];
  if (!base) return 0;
  if (!pricesFloat) return base;
  return base * Math.pow(REF_PRICE[id] / price, 0.7);
}

export type PlannerQuotas = Record<GoodId, number>; // target output, units

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Advance one month.
 * mode "market": prices float, capacity chases price signals, no quotas.
 * mode "planner": prices frozen, quotas cap planned output, capacity fixed
 * (wheat replants slowly after the drought either way).
 */
export function step(
  state: EconomyState,
  mode: "market" | "planner",
  quotas?: PlannerQuotas,
): EconomyState {
  const s: EconomyState = structuredClone(state);
  s.month += 1;
  const pricesFloat = mode === "market";

  // Drought hits the same month in both modes, for a fair comparison.
  if (s.month === DROUGHT_MONTH) {
    s.drought = true;
    s.goods.wheat.capacity *= 0.45;
    s.log.push(
      `Month ${s.month}: 🌵 Drought. The wheat harvest collapses - capacity down 55%.`,
    );
  }

  // 1. Planned output.
  const planned = {} as Record<GoodId, number>;
  for (const g of GOODS) {
    const cap = s.goods[g.id].capacity;
    planned[g.id] = mode === "planner" && quotas ? Math.min(quotas[g.id], cap) : cap;
  }

  // 2. Household demand at current prices.
  const hh = {} as Record<GoodId, number>;
  for (const g of GOODS) hh[g.id] = householdDemand(g.id, s.goods[g.id].price, pricesFloat);

  // 3. Raw goods are produced at plan; each scarce input is then rationed
  //    proportionally among everyone who wants it (factories and households).
  const producedRaw = {
    wheat: planned.wheat,
    steel: planned.steel,
    fuel: planned.fuel,
  } as Record<GoodId, number>;

  const share = (pool: number, requests: number[]): number[] => {
    const total = requests.reduce((a, b) => a + b, 0);
    if (total <= pool || total === 0) return requests;
    return requests.map((r) => (r / total) * pool);
  };

  // steel: machines want 1/unit, shoes want 0.5/unit
  const [steelToMachines, steelToShoes] = share(producedRaw.steel, [
    planned.machines * 1,
    planned.shoes * 0.5,
  ]);
  // fuel: machines want 1/unit, households want hh.fuel
  const [fuelToMachines, fuelToHouseholds] = share(producedRaw.fuel, [
    planned.machines * 1,
    hh.fuel,
  ]);

  const producedMachines = Math.min(planned.machines, steelToMachines / 1, fuelToMachines / 1);

  // machines: bread wants 0.2/unit, shoes want 0.3/unit
  const [machinesToBread, machinesToShoes] = share(producedMachines, [
    planned.bread * 0.2,
    planned.shoes * 0.3,
  ]);

  const producedBread = Math.min(
    planned.bread,
    producedRaw.wheat / 2,
    machinesToBread / 0.2,
  );
  const producedShoes = Math.min(planned.shoes, steelToShoes / 0.5, machinesToShoes / 0.3);

  const produced: Record<GoodId, number> = {
    wheat: producedRaw.wheat,
    steel: producedRaw.steel,
    fuel: producedRaw.fuel,
    machines: producedMachines,
    bread: producedBread,
    shoes: producedShoes,
  };

  // What households actually get.
  const delivered: Record<GoodId, number> = {
    wheat: 0,
    steel: 0,
    machines: 0,
    fuel: Math.min(fuelToHouseholds, hh.fuel),
    bread: Math.min(producedBread, hh.bread),
    shoes: Math.min(producedShoes, hh.shoes),
  };

  // 4. Total demand per good (for pricing + shortage reports):
  //    industrial requests at planned levels + household demand.
  const demanded: Record<GoodId, number> = {
    wheat: planned.bread * 2,
    steel: planned.machines * 1 + planned.shoes * 0.5,
    fuel: planned.machines * 1 + hh.fuel,
    machines: planned.bread * 0.2 + planned.shoes * 0.3,
    bread: hh.bread,
    shoes: hh.shoes,
  };

  // 5. Scores (households only, same metric in both modes).
  for (const g of GOODS) {
    if (!g.consumer) continue;
    const unmet = Math.max(0, hh[g.id] - delivered[g.id]);
    const unsold = Math.max(0, (g.id === "fuel" ? fuelToHouseholds : produced[g.id]) - hh[g.id]);
    s.shortageScore += unmet * REF_PRICE[g.id];
    s.wasteScore += unsold * REF_PRICE[g.id];
  }

  // 6. Price + capacity response (market mode only).
  for (const g of GOODS) {
    const st = s.goods[g.id];
    const D = demanded[g.id];
    const S = produced[g.id];
    st.produced = S;
    st.demanded = D;

    if (pricesFloat && D + S > 0) {
      const rel = clamp((D - S) / Math.max(D, S), -1, 1);
      st.price = clamp(
        st.price * (1 + 0.45 * rel),
        REF_PRICE[g.id] * 0.3,
        REF_PRICE[g.id] * 4,
      );
      // Capacity drifts toward a bounded, price-driven target.
      const target = BASE_CAPACITY[g.id] * clamp(st.price / REF_PRICE[g.id], 0.5, 1.5);
      const rate = g.id === "wheat" ? 0.12 : 0.2; // replanting takes a season
      st.capacity += rate * (target - st.capacity);
    } else if (g.id === "wheat" && s.month > DROUGHT_MONTH) {
      // Even a planned farm replants - but without price incentives pulling
      // growers in, recovery is slower.
      st.capacity += 0.05 * (BASE_CAPACITY.wheat - st.capacity);
    }

    st.priceHistory.push(st.price);
    st.shortageHistory.push(D - S);
  }

  // 7. Narration.
  const wheat = s.goods.wheat;
  const bread = s.goods.bread;
  if (mode === "market") {
    if (s.month === DROUGHT_MONTH) {
      s.log.push(
        `Month ${s.month}: Wheat price jumps to $${wheat.price.toFixed(2)}. Nobody announced the drought - the price did.`,
      );
    } else if (s.month === DROUGHT_MONTH + 1) {
      s.log.push(
        `Month ${s.month}: Bread is dearer ($${bread.price.toFixed(2)}), so families buy a bit less - economizing without being told. High wheat prices are already pulling growers back in.`,
      );
    } else if (s.drought && wheat.capacity > BASE_CAPACITY.wheat * 0.85) {
      s.log.push(
        `Month ${s.month}: Lured by high prices, growers have nearly rebuilt wheat supply. Prices are easing back down.`,
      );
      s.drought = false;
    }
  } else if (s.month === DROUGHT_MONTH) {
    s.log.push(
      `Month ${s.month}: Prices are frozen, so nothing visible changes yet. Your reports won't show the damage for two months.`,
    );
  }

  return s;
}

export function fmtMoney(v: number): string {
  return `$${v.toFixed(2)}`;
}
