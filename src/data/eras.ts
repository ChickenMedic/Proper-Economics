// The eight eras from the product brief (§5). `id` is the value used in
// economist frontmatter; start/end drive timeline placement.
export type Era = {
  id: string;
  label: string;
  start: number;
  end: number;
  color: string;
  blurb: string;
};

export const ERAS: Era[] = [
  {
    id: "mercantilism",
    label: "Precursors & mercantilism",
    start: 1550,
    end: 1750,
    color: "#b45309",
    blurb:
      "Before economics was a discipline: merchants and officials arguing that a nation grows rich by selling more than it buys.",
  },
  {
    id: "classical-dawn",
    label: "Physiocrats & classical dawn",
    start: 1750,
    end: 1800,
    color: "#4d7c0f",
    blurb:
      "French physicians and Scottish philosophers start treating the economy as a system with laws of its own.",
  },
  {
    id: "classical",
    label: "Classical economics",
    start: 1800,
    end: 1870,
    color: "#0f766e",
    blurb:
      "The first full theories of growth, trade, rent, and population — built in the shadow of the Industrial Revolution.",
  },
  {
    id: "marx-socialists",
    label: "Marx & the socialists",
    start: 1840,
    end: 1895,
    color: "#b91c1c",
    blurb:
      "The classical toolkit turned against capitalism itself: exploitation, crisis, and the case for a different system.",
  },
  {
    id: "marginal",
    label: "Marginal revolution & neoclassical",
    start: 1870,
    end: 1920,
    color: "#7c3aed",
    blurb:
      "Value moves from labor to the margin: economics becomes about choices, trade-offs, and equilibrium.",
  },
  {
    id: "keynesian",
    label: "The Keynesian era & its rivals",
    start: 1920,
    end: 1970,
    color: "#1d4ed8",
    blurb:
      "Depression and war put governments at the center of the economy — and spark the century's great debate about planning.",
  },
  {
    id: "monetarist",
    label: "Monetarism & new classical",
    start: 1950,
    end: 1990,
    color: "#c2410c",
    blurb:
      "The counter-revolution: money matters, incentives matter, and governments fail too.",
  },
  {
    id: "behavioral",
    label: "Behavioral & modern",
    start: 1970,
    end: 2026,
    color: "#be185d",
    blurb:
      "Economics meets psychology, field experiments, and big data — and rediscovers that humans are human.",
  },
];

export const ERA_MAP: Record<string, Era> = Object.fromEntries(
  ERAS.map((e) => [e.id, e]),
);
