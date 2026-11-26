#!/usr/bin/env node
/**
 * release-base.js
 *
 * Prépare une release du thème de base, sans rien publier ni toucher aux thèmes :
 *   1. monte la version de base/package.json (patch, minor, major ou x.y.z) ;
 *   2. ajoute l'entrée du CHANGELOG (base/update-changelog.js) ;
 *   3. crée le commit « chore(base): release x.y.z ».
 *
 * Il reste à pousser sur main : le workflow .github/workflows/release-base.yml
 * publie alors le paquet sur npm et crée le tag base-vx.y.z et la release GitHub.
 * Pour épingler ensuite la nouvelle version dans les thèmes : pnpm pinned-theme.
 *
 * Usage : pnpm release:base [patch|minor|major|x.y.z] [--dry-run]
 */
const fs = require("fs");
const {
  BASE_DIR,
  BASE_PKG,
  run,
  fail,
  checkRepo,
  publishedVersions,
  replaceJsonValue,
} = require("./base-package");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const bump = args.find((a) => !a.startsWith("--")) || "patch";

function nextVersion(current, kind) {
  if (/^\d+\.\d+\.\d+$/.test(kind)) return kind;
  const [major, minor, patch] = current.split(".").map(Number);
  if (kind === "major") return `${major + 1}.0.0`;
  if (kind === "minor") return `${major}.${minor + 1}.0`;
  if (kind === "patch") return `${major}.${minor}.${patch + 1}`;
  fail(`Type de version inconnu : « ${kind} » (patch, minor, major ou x.y.z).`);
}

checkRepo(dryRun);

const basePkg = fs.readFileSync(BASE_PKG, "utf8");
const current = JSON.parse(basePkg).version;
const version = nextVersion(current, bump);

if (publishedVersions().includes(version)) {
  fail(`${version} est déjà publiée sur npm. Choisis une autre version.`);
}

console.log(`\nBase : ${current} → ${version}`);

if (dryRun) {
  console.log("\n(--dry-run : aucun fichier modifié)\n");
  process.exit(0);
}

fs.writeFileSync(
  BASE_PKG,
  replaceJsonValue(basePkg, "version", current, version),
);
run(`node update-changelog.js ${version}`, BASE_DIR);

run("git add base/package.json base/CHANGELOG.md");
run(`git commit -m "chore(base): release ${version}"`);

console.log(`
✔ Commit « chore(base): release ${version} » créé.

Pour publier : git push
Le workflow « Release base theme » publie la ${version} sur npm
et crée le tag base-v${version} et la release GitHub.
Ensuite, pour mettre les thèmes à jour : pnpm pinned-theme
`);
