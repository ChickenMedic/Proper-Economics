// Generates, from MDX frontmatter and hand-maintained data files:
//   - public/search-index.json  (client-side search)
//   - src/data/timeline.json    (timeline page data)
// Also validates cross-links (influencedBy/influenced/arguedAgainst/tryIt/
// related) so a dangling slug fails the build instead of shipping a 404.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentDir = path.join(root, "content");
const errors = [];

function readAll(dir) {
  const full = path.join(contentDir, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(full, f), "utf8"));
      return { slug: f.replace(/\.mdx$/, ""), data, content };
    });
}

const economists = readAll("economists");
const schools = readAll("schools");
const glossary = readAll("glossary");
const modules = JSON.parse(fs.readFileSync(path.join(root, "src/data/modules.json"), "utf8"));

const economistSlugs = new Set(economists.map((e) => e.slug));
const glossarySlugs = new Set(glossary.map((g) => g.slug));
const moduleSlugs = new Set(modules.map((m) => m.slug));

// ---- validation ----
const ERA_IDS = new Set([
  "mercantilism",
  "classical-dawn",
  "classical",
  "marx-socialists",
  "marginal",
  "keynesian",
  "monetarist",
  "behavioral",
]);

const bornBySlug = new Map(economists.map((e) => [e.slug, e.data.born]));

for (const e of economists) {
  const where = `economists/${e.slug}`;
  for (const field of ["name", "born", "nationality", "school", "era", "knownFor", "summary"]) {
    if (e.data[field] === undefined) errors.push(`${where}: missing "${field}"`);
  }
  if (e.data.summary && e.data.summary.trim().split(/\n\s*\n/).length !== 2)
    errors.push(`${where}: "summary" must be exactly two paragraphs separated by a blank line`);
  if (e.data.era && !ERA_IDS.has(e.data.era)) errors.push(`${where}: unknown era "${e.data.era}"`);
  for (const field of ["influencedBy", "influenced", "arguedAgainst"]) {
    for (const ref of e.data[field] ?? []) {
      if (!economistSlugs.has(ref))
        errors.push(`${where}: ${field} references unknown economist "${ref}"`);
    }
  }
  // Chronology: you can't argue with (or be influenced by) someone who
  // hadn't reached adulthood before you died. Predecessors are always fine.
  const died = e.data.died ?? 9999;
  for (const field of ["influencedBy", "arguedAgainst"]) {
    for (const ref of e.data[field] ?? []) {
      const refBorn = bornBySlug.get(ref);
      if (refBorn !== undefined && refBorn + 18 > died)
        errors.push(
          `${where}: ${field} "${ref}" (born ${refBorn}) was not an adult before ` +
            `${e.data.name} died (${e.data.died}) — the link probably belongs on the other profile`,
        );
    }
  }
  if (e.data.tryIt && !moduleSlugs.has(e.data.tryIt))
    errors.push(`${where}: tryIt references unknown module "${e.data.tryIt}"`);
  for (const w of e.data.works ?? []) {
    if (!w.url) errors.push(`${where}: work "${w.title}" has no url`);
  }
  for (const v of e.data.videos ?? []) {
    if (!v.title || !v.url) errors.push(`${where}: video entries need "title" and "url"`);
    else if (!/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(v.url))
      errors.push(`${where}: video "${v.title}" url is not a YouTube link`);
  }
  // <G term="..."> references in the body must resolve to glossary entries
  for (const m of e.content.matchAll(/<G\s+term="([^"]+)"/g)) {
    if (!glossarySlugs.has(m[1]))
      errors.push(`${where}: glossary tooltip references unknown term "${m[1]}"`);
  }
}

for (const g of glossary) {
  const where = `glossary/${g.slug}`;
  if (!g.data.term) errors.push(`${where}: missing "term"`);
  if (!g.data.short) errors.push(`${where}: missing "short" (tooltip text)`);
  for (const ref of g.data.related ?? []) {
    if (!glossarySlugs.has(ref)) errors.push(`${where}: related references unknown term "${ref}"`);
  }
}

for (const s of schools) {
  const where = `schools/${s.slug}`;
  if (!s.data.name) errors.push(`${where}: missing "name"`);
  for (const ref of s.data.keyFigures ?? []) {
    if (!economistSlugs.has(ref))
      errors.push(`${where}: keyFigures references unknown economist "${ref}"`);
  }
}

if (errors.length) {
  console.error(`\nContent validation failed (${errors.length} error(s)):\n`);
  for (const err of errors) console.error("  ✗ " + err);
  console.error();
  process.exit(1);
}

// ---- search index ----
const strip = (md) =>
  md
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`\[\]]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const searchIndex = [
  ...economists.map((e) => ({
    type: "economist",
    title: e.data.name,
    url: `/economists/${e.slug}/`,
    snippet: e.data.knownFor,
    keywords: [e.data.school, e.data.era, e.data.nationality, ...(e.data.tags ?? [])].join(" "),
  })),
  ...glossary.map((g) => ({
    type: "term",
    title: g.data.term,
    url: `/glossary/#${g.slug}`,
    snippet: g.data.short,
    keywords: strip(g.content).slice(0, 200),
  })),
  ...schools.map((s) => ({
    type: "school",
    title: s.data.name,
    url: `/schools/${s.slug}/`,
    snippet: s.data.oneLiner ?? "",
    keywords: (s.data.keyFigures ?? []).join(" "),
  })),
  ...modules
    .filter((m) => m.status === "live")
    .map((m) => ({
      type: "interactive",
      title: m.title,
      url: `/learn/${m.slug}/`,
      snippet: m.tagline,
      keywords: m.description,
    })),
  {
    type: "interactive",
    title: "Taxes: how we got here",
    url: "/tax/history/",
    snippet: "Five thousand years of taxation, from tribute to the global minimum tax.",
    keywords: "tax history income tax window tax vat laffer tithe tariff",
  },
  {
    type: "interactive",
    title: "How countries tax today",
    url: "/tax/today/",
    snippet: "Sourced tax rates for ~45 countries, compare tool, and the Laffer curve.",
    keywords: "tax rates countries compare vat corporate income laffer curve explorer",
  },
];

fs.mkdirSync(path.join(root, "public"), { recursive: true });
fs.writeFileSync(
  path.join(root, "public", "search-index.json"),
  JSON.stringify(searchIndex),
);

// ---- timeline data ----
const timeline = {
  economists: economists
    .map((e) => ({
      slug: e.slug,
      name: e.data.name,
      born: e.data.born,
      died: e.data.died ?? null,
      era: e.data.era,
      school: e.data.school,
      knownFor: e.data.knownFor,
      summary: (e.data.summary ?? "").trim(),
      flagship: !!e.data.flagship,
      influencedBy: e.data.influencedBy ?? [],
      arguedAgainst: e.data.arguedAgainst ?? [],
    }))
    .sort((a, b) => a.born - b.born),
};

fs.mkdirSync(path.join(root, "src/data"), { recursive: true });
fs.writeFileSync(
  path.join(root, "src/data/timeline.json"),
  JSON.stringify(timeline, null, 2),
);

console.log(
  `Indexes built: ${economists.length} economists, ${glossary.length} glossary terms, ` +
    `${schools.length} schools, ${modules.length} modules.`,
);
