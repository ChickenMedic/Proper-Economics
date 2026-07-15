# ProperEconomics.com

Every big idea in economics, explained so your neighbor gets it — with toys you can play with.

A free, plain-English guide to the history of economic thought: economist profiles, an interactive timeline, and hands-on simulations. Static Next.js site; no backend, no accounts, no tracking. Full product brief: `proper-economics-brief_1.md`. Agent/developer guide: `CLAUDE.md`.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000 (regenerates content indexes first)
```

- `npm run build` — static export to `out/`
- `npm run lint` / `npm run typecheck`
- `npm run indexes` — rebuild `public/search-index.json` + `src/data/timeline.json` after editing content; also validates all cross-links (dangling slugs fail the build)

Content lives in `/content` as MDX (economists, schools, glossary). Git is the CMS.

## Deploy (AWS Amplify)

1. Push this repo to GitHub (`main` branch, protected; PRs for changes).
2. In the AWS Amplify console: **New app → Host web app → GitHub**, pick this repo/`main`. Amplify reads `amplify.yml` (install → indexes → lint → typecheck → build, artifacts from `out/`).
3. Enable **preview branches / PR previews** for staging URLs.
4. Add the custom domain `propereconomics.com` under App settings → Domain management (Amplify provisions HTTPS automatically); set `www` → apex redirect.

Every push to `main` then deploys production with no manual steps; failing lint/typecheck/build blocks the deploy.

## Status (launch roadmap, brief §10)

- [x] Phase 1 — foundation: scaffold, CI build spec, static export
- [x] Phase 2 — content core: 7 flagship profiles, 9 school explainers, 50-term glossary + tooltips, search
- [x] Phase 3 — timeline v1: economists, school bands, world/tax event layers, influence arrows, mobile fallback
- [x] Phase 4 — flagship interactives: Supply & Demand; Price Signals & the Calculation Problem
- [ ] Phase 5 — tax section (`/tax/history`, `/tax/today` with verified OECD/Tax Foundation data)
- [ ] Phase 6 — remaining ~35 profiles, OG images, Lighthouse/a11y audit pass
