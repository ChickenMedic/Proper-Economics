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
  blurb: string; // two short paragraphs, separated by "\n\n", shown on the timeline
};

export const SCHOOLS: School[] = [
  {
    id: "mercantilism",
    label: "Mercantilism",
    color: "#b45309",
    start: 1550,
    end: 1776,
    oneLiner: "National wealth is gold in the vault; export more than you import.",
    blurb: "Europe's ruling idea from roughly the 1500s to the 1700s, born in an age of near-constant war between Spain, France, England, and the Dutch. Kings needed treasure to pay armies, and writers like Thomas Mun in England argued the case openly: the goal of trade policy was a favorable balance.\n\nTrade, in this view, was a contest with winners and losers, and the government's job was to make sure your side won: tax imports, subsidize exports, grant monopolies to trading companies, and run colonies as captive customers. Adam Smith made demolishing all this the opening target of The Wealth of Nations.",
  },
  {
    id: "physiocracy",
    label: "Physiocracy",
    color: "#4d7c0f",
    start: 1750,
    end: 1790,
    oneLiner: "All wealth grows from the land; let the economy follow its natural order.",
    blurb: "A small circle of French thinkers in the 1750s and 60s, led by the royal physician François Quesnay. They were the backlash against a France drowning in war debt, where taxes crushed peasants while mercantilist policy showered privileges on manufacturers and treated agriculture as a cow to be milked.\n\nTheir claim: farming creates a real surplus - plant one sack of grain, harvest five - while everything else just reshuffles what the soil produced. So stop strangling farmers with taxes and regulations. Quesnay's Tableau Économique mapped the whole economy's flows on one page, and the group coined the phrase laissez-faire.",
  },
  {
    id: "classical",
    label: "Classical",
    color: "#0f766e",
    start: 1776,
    end: 1870,
    oneLiner: "Markets, specialization, and trade make nations rich; value comes from labor and cost.",
    blurb: "Born with Adam Smith's Wealth of Nations in 1776 and dominant in Britain through the 1860s, growing up alongside the Industrial Revolution. Smith supplied the founding text; David Ricardo, Thomas Malthus, and John Stuart Mill built on it - all in revolt against the old mercantilist order of tariffs and monopolies.\n\nIts core claim still sounds slightly magical: nobody is in charge of feeding London, yet London gets fed. Millions of people pursuing their own interests, coordinated only by prices, produce order that no planner designed - and the school's great cause, free trade, won with the repeal of the Corn Laws in 1846.",
  },
  {
    id: "marxist",
    label: "Marxist",
    color: "#b91c1c",
    start: 1848,
    end: 2026,
    oneLiner: "Capitalism runs on exploited labor and is driven by crisis toward its own replacement.",
    blurb: "Forged in the 1840s, when Friedrich Engels documented the misery of Manchester's cotton mills - children on twelve-hour shifts, families sleeping eight to a cellar - and Karl Marx turned the classical economists' own labor theory of value against them. Marx's Capital (1867) gave the movement its cathedral.\n\nThe starting question is about your paycheck: if a day's work produces ten hours' worth of value, why does your wage buy only six? The gap - surplus value - goes to whoever owns the factory. History moves through class struggle, Marx argued, and capitalism's recurring crises would eventually hand the machinery to the workers who built it.",
  },
  {
    id: "austrian",
    label: "Austrian",
    color: "#a16207",
    start: 1871,
    end: 2026,
    oneLiner: "Value is subjective, knowledge is dispersed, and prices are how society thinks.",
    blurb: "Born in Vienna in 1871, when Carl Menger helped topple the labor theory of value with marginal thinking. Its defining fight came in the twentieth century, when Ludwig von Mises and Friedrich Hayek argued that socialist central planning couldn't work: without market prices, the numbers a planner needs simply don't exist.\n\nAn economy's most important resource is knowledge, and it's scattered across millions of heads - the farmer knows her soil, the mechanic knows his customers. No statistician can collect it all, but prices can: when frost hits the coffee crop, the price rises and millions of people economize without knowing why.",
  },
  {
    id: "neoclassical",
    label: "Neoclassical",
    color: "#7c3aed",
    start: 1870,
    end: 2026,
    oneLiner: "People weigh costs and benefits at the margin; markets tend toward equilibrium.",
    blurb: "The 'marginal revolution' struck in the early 1870s in three places at once - Jevons in England, Menger in Vienna, Walras in Lausanne - solving puzzles the classical labor theory of value never cracked. Alfred Marshall's Principles of Economics (1890) then turned it into the toolkit of every introductory course since.\n\nWhy is life-giving water nearly free while useless diamonds cost a fortune? Because value comes from one more unit, right now - you already have plenty of water, so the next glass is worth little. From that insight came supply-and-demand curves, and the grammar of mainstream economics ever since.",
  },
  {
    id: "institutional",
    label: "Institutional",
    color: "#0369a1",
    start: 1899,
    end: 2026,
    oneLiner: "Economies run on habits, rules, and institutions - not just prices.",
    blurb: "Born twice: first in Gilded Age America, where Thorstein Veblen mocked the rational-shopper model and coined 'conspicuous consumption,' and again in 1937, when Ronald Coase asked why firms exist at all. Later work by Douglass North and Elinor Ostrom earned the 'new institutional economics' its Nobels.\n\nBefore any price gets quoted, customs, laws, and organizations have already shaped what people want and what counts as fair - you don't haggle at the supermarket. Markets grow inside rules, and changing the rules changes what the market does: South Korea and North Korea share a peninsula and a people, not an economy.",
  },
  {
    id: "keynesian",
    label: "Keynesian",
    color: "#1d4ed8",
    start: 1936,
    end: 2026,
    oneLiner: "Total spending drives jobs and output, and it can get stuck too low without help.",
    blurb: "The Great Depression's child. By 1933 a quarter of American workers had no job, and the classical prescription - patience and balanced budgets - had failed for a decade. John Maynard Keynes's General Theory (1936) explained why, and after the war his ideas became the West's operating manual.\n\nAn economy can fail the way a stalled car fails: nothing is broken, it just isn't turning over. Scared people stop spending, businesses fire workers, and fired workers spend even less - so in a slump, Keynes argued, government should run deficits on purpose and get money moving until the engine catches.",
  },
  {
    id: "monetarist",
    label: "Monetarist",
    color: "#c2410c",
    start: 1956,
    end: 2026,
    oneLiner: "Inflation is a money-supply story; steady rules beat clever discretion.",
    blurb: "Milton Friedman's counter-revolution against the Keynesian consensus of the 1950s and 60s. His Monetary History (1963, with Anna Schwartz) blamed the Great Depression on the Federal Reserve, and his 1967 prediction of stagflation came true on schedule in the 1970s, sending monetarism's stock soaring.\n\nWhen too much money chases too few goods, prices rise - not because of greedy corporations, pushy unions, or oil sheikhs. And you can't buy permanently low unemployment with a little extra inflation, because people come to expect it and demand higher wages. Today's independent, inflation-targeting central banks are the monument.",
  },
  {
    id: "public-choice",
    label: "Public choice",
    color: "#4338ca",
    start: 1962,
    end: 2026,
    oneLiner: "Politicians and bureaucrats respond to incentives too - government can fail like markets.",
    blurb: "Crystallized in postwar America, just as economists' faith in wise intervention peaked. James Buchanan and Gordon Tullock's The Calculus of Consent (1962) founded the school, treating constitutions as a kind of contract; Buchanan called the project 'politics without romance' and won the Nobel in 1986.\n\nGovernment isn't a benevolent wizard - it's re-election-hungry politicians, budget-hungry bureaucrats, and voters who barely pay attention. Its most famous idea is rent-seeking: firms lobbying for tariffs and subsidies instead of making better products, which works because the benefits are concentrated on a few while the costs spread thinly over everyone.",
  },
  {
    id: "behavioral",
    label: "Behavioral",
    color: "#be185d",
    start: 1979,
    end: 2026,
    oneLiner: "Real people use shortcuts and make predictable mistakes - and that changes the models.",
    blurb: "Launched in the 1970s by two Israeli psychologists, Daniel Kahneman and Amos Tversky, who ran experiments on the rational-agent model that had conquered economics and catalogued the deviations. Economist Richard Thaler translated the psychology into economics proper; Nobels followed in 2002 and 2017.\n\nIt studies the people who actually exist: the ones who pay for gym memberships they never use, feel a $50 loss twice as hard as a $50 win, and pick whatever option is pre-ticked. Since the errors are systematic, policy can plan around them - hence pension auto-enrollment and government 'nudge units.'",
  },
  {
    id: "development",
    label: "Development & experimental",
    color: "#15803d",
    start: 1990,
    end: 2026,
    oneLiner: "Test what actually reduces poverty, one randomized trial at a time.",
    blurb: "The humbler heir to decades of grand theory - the postwar 'big push,' then the Washington Consensus - whose record by the 1990s was sobering: star pupils stagnated while rule-breakers like China boomed. Amartya Sen won a Nobel in 1998 for reframing the question; Esther Duflo and Abhijit Banerjee co-founded J-PAL at MIT in 2003.\n\nBorrowing the randomized controlled trial from medicine, researchers split villages or schools into a group that gets a program and a group that doesn't, then measure what actually changes. And development isn't a GDP number, Sen argued - it's the expansion of people's real capabilities to be healthy, educated, and free.",
  },
];

export const SCHOOL_MAP: Record<string, School> = Object.fromEntries(
  SCHOOLS.map((s) => [s.id, s]),
);
