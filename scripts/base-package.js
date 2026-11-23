/**
 * base-package.js
 *
 * Outils partagés par release-base.js et pinned-theme.js.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BASE_DIR = path.join(ROOT, "base");
const BASE_PKG = path.join(BASE_DIR, "package.json");
const PKG_NAME = "@imiobe/plonetheme-smartweb-base";

const run = (cmd, cwd = ROOT) =>
  execSync(cmd, { cwd, encoding: "utf8" }).trim();

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

// Sur main et sans changements non commités (avertissement seul en --dry-run)
function checkRepo(dryRun) {
  const branch = run("git rev-parse --abbrev-ref HEAD");
  if (branch !== "main") fail(`Tu es sur « ${branch} » : passe sur main.`);

  if (run("git status --porcelain") !== "") {
    const message =
      "Le dépôt a des changements non commités : commit ou stash d'abord.";
    if (!dryRun) fail(message);
    console.warn(`⚠ ${message}`);
  }
}

// Versions de base publiées sur npm ([] si npm ne répond pas)
function publishedVersions() {
  try {
    return JSON.parse(run(`npm view ${PKG_NAME} versions --json`));
  } catch (e) {
    console.warn("⚠ Impossible de lire les versions publiées sur npm.");
    return [];
  }
}

// Remplace la valeur d'une clé JSON sans reformater le fichier
function replaceJsonValue(content, key, from, to) {
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\/@-]/g, "\\$&");
  const pattern = new RegExp(`("${escape(key)}"\\s*:\\s*)"${escape(from)}"`);
  return content.replace(pattern, `$1"${to}"`);
}

module.exports = {
  ROOT,
  BASE_DIR,
  BASE_PKG,
  PKG_NAME,
  run,
  fail,
  checkRepo,
  publishedVersions,
  replaceJsonValue,
};
