// Symmetrizes influence links across economist profiles: if A lists B in
// influencedBy, B gains A in influenced (and vice versa), so "the
// conversation" reads from both ends. arguedAgainst is left as authored
// (it isn't always symmetric - half these arguments were posthumous).
// Frontmatter arrays must be single-line flow style: `influenced: [a, b]`.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const dir = path.join(process.cwd(), "content/economists");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

const profiles = new Map();
for (const f of files) {
  const slug = f.replace(/\.mdx$/, "");
  const { data } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
  profiles.set(slug, {
    influencedBy: new Set(data.influencedBy ?? []),
    influenced: new Set(data.influenced ?? []),
  });
}

for (const [slug, p] of profiles) {
  for (const b of p.influencedBy) {
    const other = profiles.get(b);
    if (!other) continue; // dangling refs are the index script's job
    other.influenced.add(slug);
  }
  for (const b of p.influenced) {
    const other = profiles.get(b);
    if (!other) continue;
    other.influencedBy.add(slug);
  }
}

let changed = 0;
for (const f of files) {
  const slug = f.replace(/\.mdx$/, "");
  const file = path.join(dir, f);
  const src = fs.readFileSync(file, "utf8");
  const p = profiles.get(slug);
  const fmt = (set) => `[${[...set].join(", ")}]`;
  let out = src
    .replace(/^influencedBy: \[[^\]]*\]/m, `influencedBy: ${fmt(p.influencedBy)}`)
    .replace(/^influenced: \[[^\]]*\]/m, `influenced: ${fmt(p.influenced)}`);
  if (out !== src) {
    fs.writeFileSync(file, out);
    changed++;
  }
}
console.log(`Cross-links symmetrized; ${changed} file(s) updated.`);
