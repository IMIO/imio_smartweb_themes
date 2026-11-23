#!/usr/bin/env node
/**
 * release-base.js
 *
 * Prépare une release du thème de base, sans rien publier :
 *   1. monte la version de base/package.json (patch, minor, major ou x.y.z) ;
 *   2. ajoute l'entrée du CHANGELOG (base/update-changelog.js) ;
 *   3. épingle cette version dans les thèmes qui utilisaient la précédente ;
 *   4. crée le commit « chore(base): release x.y.z ».
 *
 * Il reste à pousser sur main : le workflow .github/workflows/release-base.yml
 * publie alors le paquet sur npm et crée le tag base-vx.y.z et la release GitHub.
 *
 * Usage : pnpm release:base [patch|minor|major|x.y.z] [--dry-run]
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BASE_DIR = path.join(ROOT, "base");
const BASE_PKG = path.join(BASE_DIR, "package.json");
const PKG_NAME = "@imiobe/plonetheme-smartweb-base";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const bump = args.find((a) => !a.startsWith("--")) || "patch";

const run = (cmd, cwd = ROOT) =>
  execSync(cmd, { cwd, encoding: "utf8" }).trim();

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function nextVersion(current, kind) {
  if (/^\d+\.\d+\.\d+$/.test(kind)) return kind;
  const [major, minor, patch] = current.split(".").map(Number);
  if (kind === "major") return `${major + 1}.0.0`;
  if (kind === "minor") return `${major}.${minor + 1}.0`;
  if (kind === "patch") return `${major}.${minor}.${patch + 1}`;
  fail(`Type de version inconnu : « ${kind} » (patch, minor, major ou x.y.z).`);
}

// Remplace la valeur d'une clé JSON sans reformater le fichier
function replaceJsonValue(content, key, from, to) {
  const pattern = new RegExp(
    `("${key.replace(/[/@.-]/g, "\\$&")}"\\s*:\\s*)"${from.replace(/\./g, "\\.")}"`,
  );
  return content.replace(pattern, `$1"${to}"`);
}

// --- Vérifications -----------------------------------------------------------

const branch = run("git rev-parse --abbrev-ref HEAD");
if (branch !== "main") fail(`Tu es sur « ${branch} » : passe sur main.`);

if (run("git status --porcelain") !== "") {
  const message =
    "Le dépôt a des changements non commités : commit ou stash d'abord.";
  if (!dryRun) fail(message);
  console.warn(`⚠ ${message}`);
}

const basePkg = fs.readFileSync(BASE_PKG, "utf8");
const current = JSON.parse(basePkg).version;
const version = nextVersion(current, bump);

let published = [];
try {
  published = JSON.parse(run(`npm view ${PKG_NAME} versions --json`));
} catch (e) {
  console.warn("⚠ Impossible de lire les versions publiées sur npm.");
}
if (published.includes(version)) {
  fail(`${version} est déjà publiée sur npm. Choisis une autre version.`);
}

// --- Thèmes à épingler -------------------------------------------------------

const themes = fs
  .readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== "base")
  .map((d) => path.join(ROOT, d.name, "package.json"))
  .filter((file) => fs.existsSync(file))
  .filter((file) => {
    const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    return deps[PKG_NAME] === current;
  });

console.log(`\nBase : ${current} → ${version}`);
console.log(
  `Thèmes épinglés sur ${current} à mettre à jour : ${themes.length}`,
);

if (dryRun) {
  console.log("\n(--dry-run : aucun fichier modifié)\n");
  process.exit(0);
}

// --- Écriture ----------------------------------------------------------------

fs.writeFileSync(
  BASE_PKG,
  replaceJsonValue(basePkg, "version", current, version),
);
run(`node update-changelog.js ${version}`, BASE_DIR);

for (const file of themes) {
  const content = fs.readFileSync(file, "utf8");
  fs.writeFileSync(file, replaceJsonValue(content, PKG_NAME, current, version));
}

run("git add base/package.json base/CHANGELOG.md");
for (const file of themes) run(`git add "${path.relative(ROOT, file)}"`);
run(`git commit -m "chore(base): release ${version}"`);

console.log(`
✔ Commit « chore(base): release ${version} » créé.

Pour publier : git push
Le workflow « Release base theme » publie ${PKG_NAME}@${version} sur npm
et crée le tag base-v${version} et la release GitHub.
`);
