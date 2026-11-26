#!/usr/bin/env node
/**
 * pinned-theme.js
 *
 * Épingle une version du thème de base dans tous les thèmes et crée le commit
 * « chore: pin base x.y.z in themes ».
 *
 * Version : celle de base/package.json, ou celle passée en argument.
 * Thèmes mis à jour : ceux qui dépendent de base avec une version exacte de la
 * même version majeure (ex. 1.0.3 → 1.0.4). Ne sont pas touchés :
 *   - les thèmes en workspace:* (toujours sur la base locale) ;
 *   - ceux restés sur une autre version majeure (ex. 0.3.x), sauf avec --all.
 *
 * Usage : pnpm pinned-theme [x.y.z] [--all] [--dry-run]
 */
const fs = require("fs");
const path = require("path");
const {
  ROOT,
  BASE_PKG,
  PKG_NAME,
  run,
  fail,
  checkRepo,
  publishedVersions,
  replaceJsonValue,
} = require("./base-package");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const all = args.includes("--all");
const version =
  args.find((a) => !a.startsWith("--")) ||
  JSON.parse(fs.readFileSync(BASE_PKG, "utf8")).version;

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  fail(`Version invalide : « ${version} » (attendu : x.y.z).`);
}

checkRepo(dryRun);

if (!publishedVersions().includes(version)) {
  console.warn(
    `⚠ ${version} n'est pas (encore) sur npm. Les builds des thèmes utilisent la` +
      " base du dépôt, mais une installation hors du dépôt échouera.",
  );
}

const major = version.split(".")[0];
const toPin = [];
const skipped = [];

for (const dir of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name === "base") continue;
  const file = path.join(ROOT, dir.name, "package.json");
  if (!fs.existsSync(file)) continue;

  const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
  const pinned = { ...pkg.dependencies, ...pkg.devDependencies }[PKG_NAME];
  if (!pinned || pinned === version) continue;

  if (!/^\d+\.\d+\.\d+$/.test(pinned)) {
    skipped.push(`${dir.name} (${pinned})`);
  } else if (pinned.split(".")[0] !== major && !all) {
    skipped.push(`${dir.name} (${pinned}, autre version majeure)`);
  } else {
    toPin.push({ file, from: pinned });
  }
}

console.log(`\nThèmes à épingler sur ${version} : ${toPin.length}`);
if (skipped.length) console.log(`Non modifiés : ${skipped.join(", ")}`);

if (dryRun || toPin.length === 0) {
  console.log(
    dryRun ? "\n(--dry-run : aucun fichier modifié)\n" : "\nRien à faire.\n",
  );
  process.exit(0);
}

for (const { file, from } of toPin) {
  const content = fs.readFileSync(file, "utf8");
  fs.writeFileSync(file, replaceJsonValue(content, PKG_NAME, from, version));
  run(`git add "${path.relative(ROOT, file)}"`);
}
run(`git commit -m "chore: pin base ${version} in themes"`);

console.log(`
✔ Commit « chore: pin base ${version} in themes » créé (${toPin.length} thèmes).
Pour lancer le build des thèmes : git push
`);
