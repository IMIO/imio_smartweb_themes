#!/usr/bin/env node
/**
 * Instantané de la sortie compilée des thèmes, pour vérifier qu'une mise à jour
 * de la chaîne d'outils ne change pas ce qui part en production.
 *
 *   node scripts/css-snapshot.js build <sortie> [thème…] [--jobs=4]
 *   node scripts/css-snapshot.js diff <avant> <après> [--details]
 *
 * build : compile chaque thème (tous par défaut) avec webpack.config.js en mode
 *   production, mais écrit dans <sortie>/<thème>/ au lieu du dossier du thème :
 *   ni favicons, ni theme.zip, ni dist/ ne sont touchés dans le dépôt.
 * diff : compare theme.css et theme.js thème par thème. Les fichiers différents
 *   sont reformatés avec Prettier avant comparaison ; --details affiche le diff.
 *
 * Code de sortie : 1 si un build échoue ou si diff trouve une différence.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { fork, spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const EXCLUDED = new Set(["node_modules", "scripts"]);
const FILES = ["dist/css/theme.css", "dist/js/theme.js"];

function listThemes() {
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name)
    .filter((name) => !EXCLUDED.has(name) && !name.startsWith("["))
    .filter((name) => fs.existsSync(path.join(ROOT, name, "src/index.js")))
    .sort();
}

// Compile un thème dans outDir (exécuté dans un processus enfant).
function buildOne(theme, outDir) {
  const webpack = require("webpack");
  const config = require(path.join(ROOT, "webpack.config.js"))(
    { theme },
    { mode: "production" },
  );
  config.output.path = path.join(outDir, theme);
  config.plugins = config.plugins.filter(
    (p) =>
      !["FileManagerPlugin", "FaviconsWebpackPlugin"].includes(
        p.constructor.name,
      ),
  );
  config.infrastructureLogging = { level: "error" };
  webpack(config, (err, stats) => {
    const errors = err
      ? [String(err)]
      : stats.hasErrors()
        ? stats
            .toJson({ all: false, errors: true })
            .errors.map((e) => e.message)
        : [];
    process.send({ theme, errors });
    process.exit(0);
  });
}

function build(outDir, themes, jobs) {
  fs.mkdirSync(outDir, { recursive: true });
  const queue = [...themes];
  const failures = [];
  let done = 0;
  const started = Date.now();
  return new Promise((resolve) => {
    const next = () => {
      const theme = queue.shift();
      if (!theme) return;
      const child = fork(__filename, ["--worker", theme, outDir], {
        stdio: ["ignore", "ignore", "pipe", "ipc"],
      });
      let stderr = "";
      child.stderr.on("data", (d) => (stderr += d));
      let reported = false;
      child.on("message", ({ errors }) => {
        reported = true;
        if (errors.length) failures.push({ theme, errors });
      });
      child.on("exit", (code) => {
        if (!reported)
          failures.push({ theme, errors: [stderr || `exit ${code}`] });
        done += 1;
        const secs = Math.round((Date.now() - started) / 1000);
        process.stdout.write(
          `\r${done}/${themes.length} (${secs}s) ${theme}        `,
        );
        if (done === themes.length) {
          process.stdout.write("\n");
          resolve(failures);
        } else next();
      });
    };
    for (let i = 0; i < Math.min(jobs, themes.length); i++) next();
  });
}

function prettierFormat(file, parser) {
  const res = spawnSync(
    "npx",
    ["prettier", "--parser", parser, "--no-config", file],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
  );
  return res.status === 0 ? res.stdout : fs.readFileSync(file, "utf8");
}

function diff(before, after, details) {
  const themes = [
    ...new Set([...fs.readdirSync(before), ...fs.readdirSync(after)]),
  ].sort();
  let identical = 0;
  const changed = [];
  for (const theme of themes) {
    for (const rel of FILES) {
      const a = path.join(before, theme, rel);
      const b = path.join(after, theme, rel);
      if (!fs.existsSync(a) || !fs.existsSync(b)) {
        changed.push(
          `${theme}/${rel} : absent ${fs.existsSync(a) ? "après" : "avant"}`,
        );
        continue;
      }
      if (fs.readFileSync(a).equals(fs.readFileSync(b))) {
        identical += 1;
        continue;
      }
      const parser = rel.endsWith(".css") ? "css" : "babel";
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "snap-"));
      fs.writeFileSync(path.join(tmp, "a"), prettierFormat(a, parser));
      fs.writeFileSync(path.join(tmp, "b"), prettierFormat(b, parser));
      const res = spawnSync(
        "diff",
        ["-u", path.join(tmp, "a"), path.join(tmp, "b")],
        {
          encoding: "utf8",
          maxBuffer: 256 * 1024 * 1024,
        },
      );
      const lines = res.stdout.split("\n").filter((l) => /^[-+][^-+]/.test(l));
      changed.push(
        lines.length
          ? `${theme}/${rel} : ${lines.length} lignes différentes après formatage`
          : `${theme}/${rel} : identique après formatage (seul le minifieur diffère)`,
      );
      if (details && lines.length) console.log(res.stdout);
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }
  console.log(`${identical} fichiers identiques, ${changed.length} différents`);
  changed.forEach((c) => console.log(`  ${c}`));
  return changed.length === 0;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === "--worker") return buildOne(rest[0], rest[1]);
  const opts = rest.filter((a) => a.startsWith("--"));
  const args = rest.filter((a) => !a.startsWith("--"));
  if (cmd === "build" && args.length >= 1) {
    const jobsOpt = opts.find((o) => o.startsWith("--jobs="));
    const jobs = jobsOpt ? Number(jobsOpt.split("=")[1]) : 4;
    const themes = args.length > 1 ? args.slice(1) : listThemes();
    const failures = await build(path.resolve(args[0]), themes, jobs);
    failures.forEach((f) =>
      console.log(
        `ÉCHEC ${f.theme}\n  ${f.errors.join("\n  ").slice(0, 2000)}`,
      ),
    );
    process.exit(failures.length ? 1 : 0);
  }
  if (cmd === "diff" && args.length === 2) {
    const same = diff(
      path.resolve(args[0]),
      path.resolve(args[1]),
      opts.includes("--details"),
    );
    process.exit(same ? 0 : 1);
  }
  console.log(
    "Usage :\n  node scripts/css-snapshot.js build <sortie> [thème…] [--jobs=4]\n  node scripts/css-snapshot.js diff <avant> <après> [--details]",
  );
  process.exit(2);
}

main();
