# ProperEconomics.com — Product & Build Brief

**Version:** 1.0 · July 2026
**Owner:** Sam Dawson
**Intended reader:** An AI coding agent (Claude / Fable 5) or developer building the site end-to-end.
**Deployment target:** AWS Amplify (Hosting + CI/CD) connected to a GitHub repository.

---

## 1. Vision

ProperEconomics is a free, layman-friendly guide to the history of economic thought. It distills the ideas of the people who shaped how we think about markets — from the mercantilists and physiocrats through Adam Smith, Marx and Engels, Keynes, Hayek, and Friedman, up to modern behavioral economists — into plain-English profiles, an interactive timeline, and hands-on simulations.

The site has a point of view grounded in mainstream economics: markets coordinate through prices, and the site should *show* (not just tell) why price signals matter — including an interactive demonstration of the socialist calculation problem, i.e. where centrally planned economies break down because price indicators disappear.

**One-sentence pitch:** "Every big idea in economics, explained so your neighbor gets it — with toys you can play with."

### Design principles

1. **Plain English first.** Every concept must be explainable to a smart 15-year-old. Jargon is allowed only if defined inline on first use (hover/tap tooltip glossary).
2. **Show, don't tell.** Wherever a concept can be interactive (supply/demand, price ceilings, inflation, the calculation problem), prefer a simulation over a paragraph.
3. **Steelman everyone.** Marx gets as fair and accurate a summary of what he actually argued as Friedman does. Critique comes after honest exposition, clearly labeled ("What he argued" vs. "Where it breaks down" vs. "Lasting influence").
4. **History as narrative.** Ideas respond to each other. The timeline and profiles should cross-link so readers can follow the conversation across centuries (Smith → Ricardo → Marx → Marshall → Keynes → Hayek/Friedman → behavioralists).
5. **No paywalls, no accounts, no tracking beyond basic privacy-respecting analytics.**

## 2. Audience

- **Primary:** Curious adults with no economics background — podcast listeners, news readers who see "Keynesian" or "monetarist" and want to actually understand it.
- **Secondary:** High-school and undergraduate students looking for intuitive supplements to coursework.
- **Tertiary:** Teachers who want embeddable/classroom-friendly interactive demos.

Reading level target: Flesch-Kincaid grade 8–10 for profile summaries; deeper "Go further" sections can run higher.

## 3. Technical requirements

### Stack

- **Framework:** Next.js (App Router) with static generation (SSG) for all content pages. The site is overwhelmingly static content + client-side interactivity, so `output: 'export'` or Amplify's SSR support both work — prefer full static export unless a feature forces SSR.
- **Language:** TypeScript throughout.
- **Styling:** Tailwind CSS. Light and dark mode.
- **Interactives:** React components using D3 (scales/shapes only, React owns the DOM) or lightweight canvas where performance demands it. No heavyweight charting libraries for the simulations — the interactives are bespoke and central to the product.
- **Content:** MDX files in-repo (`/content/economists/*.mdx`, `/content/tax/*.mdx`, `/content/concepts/*.mdx`) with typed frontmatter (name, years, school, era, tags, related figures). No CMS in v1 — Git is the CMS.
- **Search:** Client-side search over a build-time JSON index (e.g., FlexSearch or Pagefind). No backend.

### Hosting & CI/CD

- **Repo:** GitHub, `main` branch protected; feature branches + PRs.
- **AWS Amplify Hosting** connected to the GitHub repo:
  - `main` → production (propereconomics.com)
  - `develop` (or PR previews via Amplify preview branches) → staging URLs.
- `amplify.yml` build spec in-repo: install, lint, type-check, unit tests, build. A failing check blocks deploy.
- Custom domain propereconomics.com with automatic HTTPS via Amplify's managed certificates; `www` redirects to apex.
- No backend services in v1 (no AppSync/DynamoDB/Cognito). Everything is static + client-side. If a "quiz progress" feature is wanted later, start with localStorage-free in-memory state or defer entirely.

### Non-functional requirements

- **Performance:** Lighthouse ≥ 90 on all categories for content pages. Interactives lazy-load below the fold. Total JS on a profile page < 200 KB gzipped.
- **Accessibility:** WCAG 2.1 AA. Every simulation needs a text alternative that states what the interactive demonstrates and lets keyboard users drive it (sliders must be real `<input type="range">` or ARIA sliders).
- **Mobile-first:** All interactives must work with touch; the timeline must degrade to a vertical scroll on small screens.
- **SEO:** Static rendering, semantic HTML, per-page metadata, OpenGraph images per economist (generated at build), sitemap.xml, structured data (`Person` schema for economist profiles).

## 4. Site architecture

```
/                         Home: mission, featured interactive, timeline teaser, era entry points
/timeline                 The interactive timeline (flagship navigation)
/economists               Filterable index (era, school, topic)
/economists/[slug]        Profile pages (~40 at launch)
/schools                  Index of schools of thought
/schools/[slug]           School explainers (~12)
/learn                    Interactive concept modules index
/learn/supply-and-demand  Flagship interactive #1
/learn/price-signals      Flagship interactive #2 (calculation problem)
/learn/[slug]             Further modules (roadmap)
/tax                      Tax regimes hub
/tax/history              Historical tax regimes narrative + timeline overlay
/tax/today                Country comparison explorer
/glossary                 Plain-English glossary (powers site-wide tooltips)
/about                    Mission, methodology, sources, corrections policy
```

Global elements: persistent header with search; every jargon term site-wide renders as a dotted-underline tooltip linked to the glossary; every profile cross-links "influenced by / influenced / argued against."

---

## 5. The economists — launch roster (~40 figures)

Each figure gets a profile page built from the same MDX template:

**Profile template (every page, in order):**
1. **Hero:** name, portrait (public-domain image), years, nationality, school-of-thought badge, one-line "Known for."
2. **The idea in one paragraph** — the distillation. This is the product. Max ~120 words.
3. **The world they lived in** — 2–3 paragraphs of historical context (what problem were they answering?).
4. **What they argued** — steelmanned, plain-English exposition with concrete everyday examples.
5. **Where it breaks down / critiques** — honest, clearly labeled counterarguments.
6. **Lasting influence** — what in today's world traces back to them (policies, institutions, phrases).
7. **The conversation** — influenced by / influenced / argued against (cross-links).
8. **Try it** — link to any related interactive module.
9. **Further reading** — the economist's own major works listed first, each with a link to read it: prefer free full-text sources for public-domain works (Project Gutenberg, Online Library of Liberty, Marxists Internet Archive for Marx/Engels), and a bookseller or publisher link for in-copyright works. Then 2–3 accessible secondary sources. Frontmatter carries a `works` array (title, year, url, free: true/false) so the list renders consistently and links can be checked in CI.

**Launch roster, grouped by era** (frontmatter `era` drives the timeline):

*Precursors & mercantilism (1550–1750):* Thomas Mun (trade surpluses as national wealth), William Petty (early national accounting), John Locke (property, money), Richard Cantillon (entrepreneurship, "Cantillon effect"), Bernard Mandeville (private vices, public benefits).

*Physiocrats & classical dawn (1750–1800):* François Quesnay (Tableau Économique, laissez-faire), Anne-Robert-Jacques Turgot (diminishing returns), **Adam Smith** (invisible hand, division of labor, *Wealth of Nations*) — flagship profile, extra depth.

*Classical economics (1800–1870):* Thomas Malthus (population), David Ricardo (comparative advantage, rent), Jean-Baptiste Say (Say's law), John Stuart Mill (classical synthesis, liberty), Frédéric Bastiat (the seen and the unseen, satire of protectionism).

*Marx & the socialists (1840–1895):* **Karl Marx** (labor theory of value, historical materialism, crisis theory) — flagship profile, extra depth; **Friedrich Engels** (co-author, financier, systematizer; profile explains his distinct role), Robert Owen (utopian socialism, cooperatives).

*Marginal revolution & neoclassical (1870–1920):* William Stanley Jevons, Carl Menger (subjective value, founder of Austrian school), Léon Walras (general equilibrium), Alfred Marshall (supply & demand scissors, elasticity — links directly to the S&D interactive), Vilfredo Pareto (Pareto efficiency), Thorstein Veblen (conspicuous consumption), Irving Fisher (quantity theory, debt-deflation).

*The Keynesian era & its rivals (1920–1970):* **John Maynard Keynes** (aggregate demand, animal spirits, *General Theory*) — flagship profile, extra depth; Joseph Schumpeter (creative destruction), **Friedrich Hayek** (knowledge problem, prices as information — anchor for the price-signals interactive), Ludwig von Mises (economic calculation problem — co-anchor for that interactive), Joan Robinson (imperfect competition), Paul Samuelson (mathematical synthesis, textbook Keynesianism), John Kenneth Galbraith (affluent society, countervailing power).

*Monetarism & new classical (1950–1990):* **Milton Friedman** (monetarism, permanent income, "inflation is always and everywhere a monetary phenomenon") — flagship profile, extra depth; Ronald Coase (transaction costs, Coase theorem), James Buchanan (public choice — government failure as counterpart to market failure), Robert Lucas (rational expectations), Arthur Laffer (Laffer curve — links to tax section).

*Behavioral & modern (1970–today):* Gary Becker (economics of everyday life), Amartya Sen (capabilities, famines), Daniel Kahneman & Amos Tversky (joint profile — heuristics and biases), Richard Thaler (nudge), Elinor Ostrom (governing the commons — neither pure market nor state), Esther Duflo & Abhijit Banerjee (joint profile — randomized trials in development), Thomas Piketty (inequality, r > g — links to tax section).

That's 42 profile pages covering 44 individuals (two joint profiles). **Build order:** the six flagships first (Smith, Marx, Engels, Keynes, Hayek+Mises, Friedman), then one representative per era, then fill.

## 6. The timeline (flagship navigation)

`/timeline` is the site's centerpiece and second entry point after home.

- **Layout:** horizontal, zoomable/pannable timeline from ~1550 to today. Each economist is a node (portrait chip) positioned by lifespan; hover/tap expands a card with the one-line "Known for" and a link to the profile.
- **Layers (toggleable):**
  1. *Economists* — the default layer.
  2. *Schools of thought* — colored bands (mercantilism, physiocracy, classical, Marxist, Austrian, neoclassical, Keynesian, monetarist, behavioral) showing when each school rose and peaked.
  3. *World events* — sparse markers for context: Industrial Revolution, 1848 revolutions, Russian Revolution, Great Depression, Bretton Woods, 1970s stagflation, fall of the Berlin Wall, 2008 crisis, COVID-19.
  4. *Tax regimes* — key markers from the tax section (see §7), so users see e.g. that Keynes and the rise of income tax are contemporaries.
- **Connections mode:** selecting an economist draws influence arrows (influenced by / argued against) across the timeline — this is how the "ideas as a conversation" principle becomes visible.
- **Mobile:** vertical scrolling era-by-era list with the same cards; no pan/zoom gymnastics on small screens.
- **Implementation notes:** data-driven from a single `timeline.json` generated at build from MDX frontmatter; D3 scales + React rendering; virtualize nodes when zoomed out.

## 7. Tax regimes — historical and today

Taxes are where economic theory meets everyone's paycheck, so this section grounds the abstract ideas.

### /tax/history — how we got here

A scrolling narrative (with its own mini-timeline that can overlay onto the main site timeline) covering, at minimum:

- **Ancient & medieval:** tribute, tithes, and land taxes (Egypt, Rome's *tributum*, the Islamic *zakat*, feudal dues); why land was the tax base when land was the wealth.
- **Early modern:** customs, excises, and the window tax (a case study in taxes distorting behavior — bricked-up windows still visible in England); mercantilist tariffs; "no taxation without representation" and the American Revolution; the salt tax and the French Revolution.
- **The income tax arrives:** Pitt's 1799 wartime income tax; the U.S. Civil War income tax; the 16th Amendment (1913); how WWI and WWII turned income tax from a class tax into a mass tax (withholding, 90%+ top marginal rates of the 1940s–50s).
- **The postwar settlement and its unwinding:** high progressive rates + growth in the 1950s–60s; stagflation; the supply-side turn (Laffer, Thatcher, Reagan's 1981/1986 acts); VAT's global spread from 1954 France to ~175 countries.
- **Today's debates:** flat vs. progressive, wealth taxes (Piketty), carbon taxes as Pigouvian taxes, global minimum corporate tax (OECD Pillar Two).

Each episode links to the economists whose ideas drove it (Smith's four maxims of taxation, Ricardo on rent, George on land value, Laffer, Piketty).

### /tax/today — country comparison explorer

An interactive explorer, data-driven from a build-time JSON dataset:

- **Data:** top marginal personal income tax rate, corporate rate, VAT/GST standard rate, tax-to-GDP ratio, and social contribution rates for ~40 countries (all OECD + BRICS + a few notable outliers like the zero-income-tax Gulf states).
- **Sources:** OECD Global Revenue Statistics database and Tax Foundation country data. Cite per-country with a "data as of" year in the UI. The build agent must fetch and verify current figures at build time — do not hardcode from memory.
- **Views:** (1) sortable/filterable table; (2) world map choropleth; (3) "compare two countries" side-by-side; (4) a "you decide" mini-tool: pick an income, see roughly how it would be taxed under 3–4 stylized regimes (flat, progressive US-style, Nordic-style, zero-income-tax/consumption-heavy) — clearly labeled as simplified illustrations, not tax advice.
- **Interactive Laffer curve:** a slider for tax rate showing stylized revenue response, with honest framing (the peak's location is empirically disputed; show a shaded uncertainty band, not a single confident curve).

## 8. Interactive concept modules (`/learn`)

These are the product's signature. Two ship at launch; the rest are roadmap. All share a visual system: same axes style, same color language (demand = one hue, supply = another), same control patterns (sliders, draggable points, scenario buttons), same "What just happened?" explainer panel that narrates in plain English after every user action.

### 8.1 Flagship: Supply & Demand (`/learn/supply-and-demand`)

A guided, five-act interactive. Each act is one screen with one idea:

1. **Demand:** a draggable price line on a demand curve for a concrete good (coffee). Raise the price, watch quantity demanded fall; the explainer narrates ("At $9 a cup, only die-hards buy").
2. **Supply:** same for supply — higher prices coax more sellers in.
3. **Equilibrium:** both curves; the user drags price and sees shortage/surplus bars appear; release and price "falls" or "rises" toward the crossing point with a gentle animation. Key line: *nobody set this price — it found itself.*
4. **Shocks:** scenario buttons shift curves (frost kills the coffee harvest → supply shifts left; coffee declared healthy → demand shifts right). User predicts, then sees the new equilibrium.
5. **Interventions:** price ceiling and price floor sliders showing persistent shortage/surplus (rent control and minimum wage as the labeled real-world examples, presented with the mainstream range of views on each).

Sandbox mode after act 5: all controls unlocked.

### 8.2 Flagship: Price Signals & the Calculation Problem (`/learn/price-signals`)

The site's intellectual centerpiece: an interactive that lets the user *feel* Mises's calculation problem and Hayek's knowledge problem, then explains where 20th-century planned economies broke down.

**Act 1 — You are the market.** A toy economy of ~6 goods (bread, steel, shoes, fuel, wheat, machines) with interlinked supply chains (steel + fuel → machines; machines + wheat → bread...). In market mode, prices float. A drought hits wheat: the user watches the price ripple propagate — wheat up, bread up, consumers economize without being told, farmers plant more. The explainer narrates Hayek's point: *the price carried the knowledge; no one needed to know about the drought to respond to it.*

**Act 2 — You are the planner.** Same economy, but now the user sets all production quotas and prices by hand. Prices are frozen; the drought hits; nothing signals. The user must notice the shortage from lagging reports (deliberately delayed a few "months"), guess how much wheat to reallocate, and inevitably create cascading shortages or gluts elsewhere. Score the outcome (bread lines, wasted steel) against Act 1's market response.

**Act 3 — Why it breaks.** Plain-English synthesis: without market prices, the planner has no way to compare the value of alternatives (calculation problem) and no way to harvest dispersed, local knowledge (knowledge problem). Historical grounding: Soviet Gosplan's material balances, queues and gluts, the 1980s Soviet economy; the module is honest that real planned economies also had successes to explain (early heavy industrialization, wartime mobilization) and lets the reader see why those are the exceptions that fit the theory (few goods, clear single objective).

**Tone requirement:** this module critiques the *mechanism*, not the people; it should read as "here is why this design fails," not as polemic. It links to the Marx profile's steelman so readers get the full conversation: Marx's critique of capitalism → Mises/Hayek's critique of planning → the reader decides.

### 8.3 Roadmap modules (post-launch)

Comparative advantage (trade between two islands), inflation & the money supply (Fisher/Friedman), the multiplier (Keynes), creative destruction (Schumpeter), tragedy of the commons vs. Ostrom's rules, marginal utility (why water is cheap and diamonds dear), nudge/choice architecture (Thaler).

## 9. Content style guide

- **Voice:** warm, direct, a little wry. Like a favorite teacher, not a textbook. Second person welcome ("You've felt this at the gas pump").
- **Examples before abstractions:** every concept opens with a concrete everyday scenario before naming the principle.
- **Numbers:** rounded and contextualized ("about the price of a coffee," not "$4.37").
- **Fairness rules:** (1) exposition before critique, always; (2) critiques cite who makes them; (3) contested empirical claims are labeled contested; (4) the site's market-oriented perspective is stated openly on /about rather than smuggled into profiles.
- **Citations:** every profile's factual claims trace to the "Go further" sources; a corrections policy lives on /about.
- **Glossary:** every term used in more than one page gets a glossary entry (target ~120 terms at launch: elasticity, marginal, real vs. nominal, fiscal vs. monetary, rent-seeking, externality...).

## 10. Build roadmap

**Phase 1 — Foundation (repo → first deploy):** Next.js + TypeScript + Tailwind + MDX pipeline scaffolded; GitHub repo with branch protection; Amplify app connected, `amplify.yml`, domain + HTTPS live with a holding page; CI running lint/type-check/tests on PRs.

**Phase 2 — Content core:** profile template component; the 6 flagship profiles (Smith, Marx, Engels, Keynes, Hayek+Mises paired with distinct pages, Friedman); glossary + tooltip system; /economists index; search.

**Phase 3 — Timeline:** timeline.json build step; interactive timeline with economists + schools layers; mobile fallback.

**Phase 4 — Flagship interactives:** supply & demand module; price-signals module; shared interactive design system extracted as reusable components.

**Phase 5 — Tax section:** /tax/history narrative; /tax/today explorer with verified current data; Laffer interactive; world-events + tax layers added to timeline.

**Phase 6 — Fill & polish:** remaining ~35 profiles; school explainer pages; OG image generation; Lighthouse/accessibility audit pass; launch.

Each phase ends deployed to production — the site grows in public rather than launching all at once.

## 11. Acceptance criteria (definition of done)

- [ ] `git push` to `main` deploys to https://propereconomics.com via Amplify with zero manual steps; PRs get preview URLs.
- [ ] All 42 profile pages published, each following the 9-part template, each listing the economist's major works with working links (free full-text where public domain) plus ≥2 secondary sources; a CI link-checker passes.
- [ ] Timeline renders all figures with era/school layers; connections mode works; usable on a phone.
- [ ] Both flagship interactives fully keyboard-accessible with text alternatives; work on touch; explainer panel narrates every state change.
- [ ] Tax explorer shows sourced, dated figures for ≥35 countries; every figure links to its source.
- [ ] Lighthouse ≥ 90 (performance, accessibility, best practices, SEO) on home, one profile, timeline, and one interactive.
- [ ] Glossary tooltips work site-wide; search returns profiles, glossary terms, and modules.
- [ ] /about states methodology, perspective, sources, and corrections policy.
- [ ] No user accounts, no cookies requiring a consent banner, no browser-storage dependencies.

## 12. Notes for the build agent

- **Verify data, don't recall it.** Tax rates, dates of Nobel prizes, and biographical dates must be checked against sources at build time (OECD, Tax Foundation, Britannica/Stanford Encyclopedia of Philosophy for biographies), not written from model memory.
- **Portraits:** use public-domain images (Wikimedia Commons) and record the source/license per image in frontmatter.
- **Engels is not a footnote:** give him a real profile covering *The Condition of the Working Class in England*, his partnership with and financing of Marx, and his role editing *Capital* vols. 2–3.
- **Hayek and Mises get separate profiles** but share the price-signals module as their "Try it."
- **Start content in English only;** structure MDX so localization is possible later.
- **Ask the owner** before adding any backend service, analytics vendor, or third-party embed.
