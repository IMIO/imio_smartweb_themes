#!/usr/bin/env node
/**
 * Génère l'index des variables du thème de base, groupées par zone.
 * Utilisé par le skill `integrer-maquette` pour mapper une maquette sur les variables.
 *
 *   node scripts/gen-variables-index.js
 *
 * Sortie : .claude/skills/integrer-maquette/references/variables.md
 * À relancer quand base/src/scss/variables.scss change.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "base/src/scss/variables.scss");
const target = path.join(
  root,
  ".claude/skills/integrer-maquette/references/variables.md",
);

const MAX_VALUE = 70;
const short = (value) =>
  value.length > MAX_VALUE ? `${value.slice(0, MAX_VALUE - 1)}…` : value;

const sections = [];
let current = { title: "Général", vars: [] };
sections.push(current);

for (const line of fs.readFileSync(source, "utf8").split("\n")) {
  const heading = line.match(
    /^\/\/\*?\/{0,3}\s*([A-Za-zÀ-ÿ0-9][^@$]*?)\s*\/*$/,
  );
  if (heading && !line.includes("{")) {
    current = { title: heading[1], vars: [] };
    sections.push(current);
    continue;
  }

  const variable = line.match(/^(\$[A-Za-z0-9_-]+):\s*(.+?);?\s*$/);
  if (!variable) continue;

  const [, name, rawValue] = variable;
  const value = rawValue
    .replace(/\s*\/\/.*$/, "")
    .replace(/\s*!default;?$/, "")
    .replace(/;$/, "");
  const isAsset = /^url\(/.test(value);
  current.vars.push({
    name,
    value: isAsset ? "url(svg…)" : short(value),
    inherited: /!default/.test(rawValue),
  });
}

const out = [
  "# Index des variables du thème de base",
  "",
  "> Généré par `node scripts/gen-variables-index.js` depuis `base/src/scss/variables.scss`. Ne pas éditer à la main.",
  "",
  "Un thème ne déclare que les variables qui **diffèrent** de ces valeurs par défaut, dans `src/scss/variables.scss`, sans `!default`.",
  "",
];

let total = 0;
for (const section of sections) {
  if (!section.vars.length) continue;
  total += section.vars.length;
  out.push(`## ${section.title}`, "", "| Variable | Défaut |", "|---|---|");
  for (const v of section.vars) {
    out.push(`| \`${v.name}\` | \`${v.value.replace(/\|/g, "\\|")}\` |`);
  }
  out.push("");
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, `${out.join("\n")}\n`);
console.log(
  `${total} variables, ${sections.filter((s) => s.vars.length).length} sections → ${path.relative(root, target)}`,
);
