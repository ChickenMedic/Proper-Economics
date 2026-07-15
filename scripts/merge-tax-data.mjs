// Merges src/data/tax-parts/*.json into src/data/tax-data.json, validating
// every figure. Run manually after updating the source parts:
//   node scripts/merge-tax-data.mjs
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const partsDir = path.join(root, "src/data/tax-parts");
const errors = [];
const warnings = [];

const REGIONS = new Set(["Europe", "Americas", "Asia-Pacific", "Middle East & Africa"]);

const files = fs.readdirSync(partsDir).filter((f) => f.endsWith(".json"));
const countries = [];
const seen = new Set();

for (const file of files) {
  let part;
  try {
    part = JSON.parse(fs.readFileSync(path.join(partsDir, file), "utf8"));
  } catch (e) {
    errors.push(`${file}: does not parse as JSON (${e.message})`);
    continue;
  }
  if (!Array.isArray(part)) {
    errors.push(`${file}: expected a JSON array`);
    continue;
  }

  for (const c of part) {
    const where = `${file} → ${c.name ?? "?"}`;
    for (const field of ["name", "iso", "region", "asOf"]) {
      if (c[field] === undefined || c[field] === null)
        errors.push(`${where}: missing "${field}"`);
    }
    if (typeof c.oecd !== "boolean") errors.push(`${where}: "oecd" must be boolean`);
    if (c.region && !REGIONS.has(c.region))
      errors.push(`${where}: unknown region "${c.region}"`);
    if (seen.has(c.iso)) errors.push(`${where}: duplicate iso "${c.iso}"`);
    seen.add(c.iso);

    const range = (field, lo, hi) => {
      const v = c[field];
      if (v === null || v === undefined) {
        if (v === undefined) c[field] = null;
        if (!c[`${field.replace("Rate", "")}Note`] && !c[`${field}Note`] && field !== "taxToGdp")
          warnings.push(`${where}: ${field} is null with no explanatory note`);
        return;
      }
      if (typeof v !== "number" || v < lo || v > hi)
        errors.push(`${where}: ${field}=${v} outside sane range [${lo},${hi}]`);
    };
    range("topIncomeRate", 0, 70);
    range("corporateRate", 0, 45);
    range("vatRate", 0, 30);
    range("taxToGdp", 0, 55);
    if (c.taxToGdp !== null && c.taxToGdp !== undefined && !c.taxToGdpYear)
      errors.push(`${where}: taxToGdp present but taxToGdpYear missing`);
    if (!Array.isArray(c.sources) || c.sources.length === 0)
      errors.push(`${where}: needs at least one source`);
    else
      for (const s of c.sources)
        if (!s.label || !s.url || !/^https?:\/\//.test(s.url))
          errors.push(`${where}: malformed source ${JSON.stringify(s)}`);
    if (c.asOf && (c.asOf < 2023 || c.asOf > 2026))
      warnings.push(`${where}: asOf=${c.asOf} looks stale`);

    countries.push(c);
  }
}

if (warnings.length) {
  console.warn(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.warn("  ⚠ " + w);
}
if (errors.length) {
  console.error(`\nTax data validation failed (${errors.length} error(s)):\n`);
  for (const e of errors) console.error("  ✗ " + e);
  process.exit(1);
}

countries.sort((a, b) => a.name.localeCompare(b.name));
const out = {
  updated: new Date().toISOString().slice(0, 10),
  countries,
};
fs.writeFileSync(
  path.join(root, "src/data/tax-data.json"),
  JSON.stringify(out, null, 2),
);
console.log(`\nMerged ${countries.length} countries from ${files.length} part file(s) → src/data/tax-data.json`);
