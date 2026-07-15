// Schools of thought. `id` is the value used in economist frontmatter
// (`school:`) and must match a file in /content/schools when an explainer
// exists. start/end/peak drive the timeline's school-bands layer.
export type School = {
  id: string;
  label: string;
  color: string;
  start: number;
  end: number; // end of *dominance*, not existence; ongoing schools use 2026
  oneLiner: string;
};

export const SCHOOLS: School[] = [
  {
    id: "mercantilism",
    label: "Mercantilism",
    color: "#b45309",
    start: 1550,
    end: 1776,
    oneLiner: "National wealth is gold in the vault; export more than you import.",
  },
  {
    id: "physiocracy",
    label: "Physiocracy",
    color: "#4d7c0f",
    start: 1750,
    end: 1790,
    oneLiner: "All wealth grows from the land; let the economy follow its natural order.",
  },
  {
    id: "classical",
    label: "Classical",
    color: "#0f766e",
    start: 1776,
    end: 1870,
    oneLiner: "Markets, specialization, and trade make nations rich; value comes from labor and cost.",
  },
  {
    id: "marxist",
    label: "Marxist",
    color: "#b91c1c",
    start: 1848,
    end: 2026,
    oneLiner: "Capitalism runs on exploited labor and is driven by crisis toward its own replacement.",
  },
  {
    id: "austrian",
    label: "Austrian",
    color: "#a16207",
    start: 1871,
    end: 2026,
    oneLiner: "Value is subjective, knowledge is dispersed, and prices are how society thinks.",
  },
  {
    id: "neoclassical",
    label: "Neoclassical",
    color: "#7c3aed",
    start: 1870,
    end: 2026,
    oneLiner: "People weigh costs and benefits at the margin; markets tend toward equilibrium.",
  },
  {
    id: "institutional",
    label: "Institutional",
    color: "#0369a1",
    start: 1899,
    end: 2026,
    oneLiner: "Economies run on habits, rules, and institutions — not just prices.",
  },
  {
    id: "keynesian",
    label: "Keynesian",
    color: "#1d4ed8",
    start: 1936,
    end: 2026,
    oneLiner: "Total spending drives jobs and output, and it can get stuck too low without help.",
  },
  {
    id: "monetarist",
    label: "Monetarist",
    color: "#c2410c",
    start: 1956,
    end: 2026,
    oneLiner: "Inflation is a money-supply story; steady rules beat clever discretion.",
  },
  {
    id: "public-choice",
    label: "Public choice",
    color: "#4338ca",
    start: 1962,
    end: 2026,
    oneLiner: "Politicians and bureaucrats respond to incentives too — government can fail like markets.",
  },
  {
    id: "behavioral",
    label: "Behavioral",
    color: "#be185d",
    start: 1979,
    end: 2026,
    oneLiner: "Real people use shortcuts and make predictable mistakes — and that changes the models.",
  },
  {
    id: "development",
    label: "Development & experimental",
    color: "#15803d",
    start: 1990,
    end: 2026,
    oneLiner: "Test what actually reduces poverty, one randomized trial at a time.",
  },
];

export const SCHOOL_MAP: Record<string, School> = Object.fromEntries(
  SCHOOLS.map((s) => [s.id, s]),
);
