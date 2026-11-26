#!/usr/bin/env node
/**
 * Contrôle d'accessibilité d'un thème (WCAG 2.1 AA).
 *
 *   node scripts/a11y-check.js <theme>            # contrastes + lint SCSS
 *   node scripts/a11y-check.js base               # valeurs par défaut de la base
 *   node scripts/a11y-check.js <theme> --json     # sortie machine
 *
 * 1. Contrastes : compile les variables du thème (puis celles de la base, comme
 *    dans main.scss) et calcule le ratio de chaque paire texte/fond de PAIRS.
 *    Pour chaque échec, propose la teinte conforme la plus proche.
 * 2. Lint : repère dans le SCSS propre au thème les motifs à risque
 *    (focus supprimé, animations, polices minuscules, couleurs hors variables).
 *
 * Code de sortie : 1 s'il y a au moins un échec de contraste, sinon 0.
 * Les avertissements du lint ne font pas échouer.
 */
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const sass = require("sass-embedded");

const root = path.resolve(__dirname, "..");

// Seuils WCAG 2.1 : texte normal 4.5, grand texte 3, composants graphiques et UI 3.
const RATIO = { text: 4.5, large: 3, ui: 3 };

/**
 * Paires texte/fond issues des variables de la base.
 * fg/bg : nom de variable (sans $) ou littéral "#rrggbb".
 * fallback : fond utilisé quand bg est transparent (par défaut blanc).
 * 6e élément `true` : le fond n'est pas piloté par une variable, il est supposé.
 * Un fond littéral ou transparent est toujours considéré comme supposé : un échec
 * y devient « à vérifier » (échec seulement si le fond réel est bien celui supposé).
 * Une paire dont une variable n'est pas une couleur (initial, inherit…) est ignorée.
 */
const PAIRS = [
  ["Texte courant", "black-color", "#fff", "text"],
  ["Titres", "font-title-color", "#fff", "large"],
  [
    "Header : liens de navigation",
    "header-nav-link-color",
    "header-top-background",
    "text",
  ],
  [
    "Header : liens (compte, recherche)",
    "header-links-color",
    "header-top-background",
    "text",
  ],
  [
    "Header : compte au survol",
    "header-links-account-hover-color",
    "header-links-account-hover-bg",
    "text",
    "header-top-background",
  ],
  [
    "Navigation : lien",
    "nav-link-color",
    "header-top-background",
    "text",
    null,
    true,
  ],
  [
    "Navigation : lien actif",
    "nav-link-active-color",
    "header-top-background",
    "text",
    null,
    true,
  ],
  ["Sous-site : logo", "subsite-logo-color", "subsite-logo-background", "text"],
  ["Sous-site : lien", "sub-nav-link-color", "subsite-navbar-bg", "text"],
  [
    "Sous-site : lien actif",
    "sub-nav-link-active-color",
    "subsite-navbar-bg",
    "text",
  ],
  [
    "Bandeau : titre",
    "banner-content-title-color",
    "banner-content-background",
    "large",
  ],
  [
    "Bandeau : description",
    "banner-content-description-color",
    "banner-content-background",
    "text",
  ],
  ["Voir tout", "see-all-color", "see-all-bg", "text"],
  ["Voir tout : survol", "see-all-hover-color", "see-all-hover-bg", "text"],
  ["Accès rapides : titre", "quick-access-title-color", "#fff", "text"],
  [
    "Accès rapides : icône",
    "quick-access-svg-color",
    "quick-access-background",
    "ui",
  ],
  [
    "À la une : titre",
    "a-la-une-item-title-color",
    "a-la-une-text-bg",
    "large",
  ],
  ["Actualités : titre de section", "actu-title-color", "#fff", "large"],
  [
    "Actualités : catégorie",
    "actu-category-color",
    "actu-category-bg-color",
    "text",
  ],
  ["Actualités : date", "actu-date-color", "actu-item-bg-color", "text"],
  ["Événements : titre de section", "event-title-color", "#fff", "large"],
  [
    "Événements : catégorie",
    "event-category-color",
    "event-category-bg-color",
    "text",
  ],
  ["Événements : date", "event-date-color", "event-item-bg-color", "text"],
  [
    "Album : titre de section",
    "album-title-color",
    "album-section-bg",
    "large",
  ],
  [
    "Album : catégorie",
    "album-category-color",
    "album-category-bg-color",
    "text",
  ],
  ["Album : date", "album-date-color", "album-item-bg-color", "text"],
  ["Newsletter", "newsletter-text-color", "newsletter-bg-color", "text"],
  ["Footer (colophon)", "colofon-color", "colofon-bg", "text"],
  ["Texte : lien", "section-text-link-color", "#fff", "text"],
  ["Texte : encadré", "mark-color", "mark-background-color", "text"],
  ["Texte : puces de liste", "list-style-color", "#fff", "ui"],
  [
    "Contact : titre",
    "section-contact-title-color",
    "section-contact-background",
    "text",
  ],
  ["Message : info", "message-info-color", "message-info-bg", "text"],
  [
    "Message : avertissement",
    "message-warning-color",
    "message-warning-bg",
    "text",
  ],
  ["Message : erreur", "message-error-color", "message-error-bg", "text"],
  ["Lien portail", "to-portal-link-color", "to-portal-link-bg", "text"],
  [
    "Lien portail : survol",
    "to-portal-link-hv-color",
    "to-portal-link-hv-bg",
    "text",
  ],
  ["Bouton retour React", "react-arrow-btn-color", "react-arrow-btn-bg", "ui"],
  ["Cookies : bouton", "cookie-banner-color", "cookie-banner-bg", "text"],
  ["Swiper : flèches", "swiper-icon-color", "swiper-background-color", "ui"],
  ["Swiper : pastilles", "swipper-bullet-color", "#fff", "ui"],
];

// ---------- couleurs ----------

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

const parseHex = (value) => {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    a: 1,
  };
};

const toHex = ({ r, g, b }) =>
  `#${[r, g, b]
    .map((c) =>
      Math.round(clamp(c, 0, 255))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;

const over = (fg, bg) => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
  a: 1,
});

const luminance = ({ r, g, b }) => {
  const lin = (c) => {
    const s = clamp(c, 0, 255) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const rgbToHsl = ({ r, g, b }) => {
  const [R, G, B] = [r, g, b].map((c) => c / 255);
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === R
      ? (G - B) / d + (G < B ? 6 : 0)
      : max === G
        ? (B - R) / d + 2
        : (R - G) / d + 4;
  return { h: h / 6, s, l };
};

const hslToRgb = ({ h, s, l }) => {
  const f = (p, q, t) => {
    const x = (t + 1) % 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  if (s === 0) return { r: l * 255, g: l * 255, b: l * 255, a: 1 };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: f(p, q, h + 1 / 3) * 255,
    g: f(p, q, h) * 255,
    b: f(p, q, h - 1 / 3) * 255,
    a: 1,
  };
};

/** Teinte conforme la plus proche : même couleur, luminosité ajustée. */
const suggest = (fg, bg, target) => {
  const hsl = rgbToHsl(fg);
  const dir = luminance(bg) > 0.5 ? -1 : 1;
  for (let step = 1; step <= 100; step++) {
    const candidate = hslToRgb({
      ...hsl,
      l: clamp(hsl.l + (dir * step) / 100, 0, 1),
    });
    if (contrast(candidate, bg) >= target) return toHex(candidate);
  }
  return dir < 0 ? "#000000" : "#ffffff";
};

// ---------- résolution des variables via Sass ----------

const variableNames = [
  ...new Set(
    PAIRS.flatMap(([, fg, bg, , fb]) => [fg, bg, fb]).filter(
      (v) => v && !v.startsWith("#"),
    ),
  ),
];

const resolveVariables = (theme) => {
  const scssDir = path.join(root, theme, "src/scss");
  const themeVars = path.join(scssDir, "variables.scss");
  const baseVars = path.join(root, "base/src/scss/variables");
  const rel = path.relative(scssDir, baseVars).split(path.sep).join("/");

  const lines = variableNames.map(
    (n) =>
      `  @if meta.global-variable-exists("${n}") { --${n}: #{a11y-rgba($${n})}; }`,
  );
  const imports = [];
  if (theme !== "base" && fs.existsSync(themeVars))
    imports.push('@import "./variables";');
  imports.push(`@import "${rel}";`);

  const source = `
@use "sass:color";
@use "sass:meta";
${imports.join("\n")}
@function a11y-rgba($c) {
  @if meta.type-of($c) != "color" { @return "none"; }
  @return "#{color.channel($c, "red", $space: rgb)},#{color.channel($c, "green", $space: rgb)},#{color.channel($c, "blue", $space: rgb)},#{color.channel($c, "alpha")}";
}
:root {
${lines.join("\n")}
}`;

  const { css } = sass.compileString(source, {
    url: pathToFileURL(path.join(scssDir, "__a11y.scss")),
    logger: sass.Logger.silent,
    silenceDeprecations: [
      "import",
      "global-builtin",
      "color-functions",
      "mixed-decls",
    ],
  });

  const resolved = {};
  for (const [, name, value] of css.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
    if (value === "none") continue;
    const [r, g, b, a] = value.split(",").map(Number);
    resolved[name] = { r, g, b, a };
  }
  return resolved;
};

const color = (ref, vars) =>
  ref.startsWith("#") ? parseHex(ref) : (vars[ref] ?? null);

const checkContrast = (vars) =>
  PAIRS.map(([label, fgRef, bgRef, kind, fallbackRef, forceAssumed]) => {
    const fg = color(fgRef, vars);
    const rawBg = color(bgRef, vars);
    if (!fg || !rawBg) return { label, fgRef, bgRef, status: "ignoré" };

    const page = { r: 255, g: 255, b: 255, a: 1 };
    const behind = (fallbackRef && color(fallbackRef, vars)) || page;
    const bg = over(rawBg, over(behind, page));
    const solidFg = over(fg, bg);

    const imageRisk = rawBg.a > 0 && rawBg.a < 1 && !fallbackRef;
    const assumed =
      !!forceAssumed ||
      bgRef.startsWith("#") ||
      (rawBg.a === 0 && !fallbackRef);

    const ratio = contrast(solidFg, bg);
    const required = RATIO[kind];
    const ok = ratio >= required;
    let status = ok ? "ok" : assumed ? "à vérifier" : "échec";
    let note;
    if (imageRisk) {
      status = "à vérifier";
      note = "fond translucide : le contraste réel dépend de l'image derrière";
    } else if (!ok && assumed) {
      note = `fond supposé ${toHex(bg)} (non piloté par une variable) : échec si le fond réel est bien celui-là`;
    }
    return {
      label,
      fgRef,
      bgRef,
      kind,
      required,
      ratio: Math.round(ratio * 100) / 100,
      fg: toHex(solidFg),
      bg: toHex(bg),
      status,
      note,
      suggestion: ok || assumed ? undefined : suggest(solidFg, bg, required),
    };
  });

// ---------- lint SCSS propre au thème ----------

const walk = (dir) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir, { withFileTypes: true })
        .flatMap((e) =>
          e.isDirectory()
            ? walk(path.join(dir, e.name))
            : e.name.endsWith(".scss")
              ? [path.join(dir, e.name)]
              : [],
        )
    : [];

const lintTheme = (theme) => {
  if (theme === "base") return [];
  const findings = [];
  for (const file of walk(path.join(root, theme, "src/scss"))) {
    const text = fs.readFileSync(file, "utf8");
    const rel = path.relative(root, file);
    const hardcoded = { count: 0, first: null };
    text.split("\n").forEach((line, i) => {
      const at = `${rel}:${i + 1}`;
      const code = line.replace(/\/\/.*$/, "");
      if (/outline\s*:\s*(none|0)\b/.test(code))
        findings.push({
          level: "warn",
          rule: "focus-supprimé",
          at,
          hint: "Remplacer par un indicateur de focus visible (contraste ≥ 3:1) ou supprimer.",
        });
      const px = /font-size\s*:\s*(\d+(?:\.\d+)?)px/.exec(code);
      if (px && Number(px[1]) < 14)
        findings.push({
          level: "warn",
          rule: "texte-trop-petit",
          at,
          hint: `${px[1]}px : utiliser rem et rester ≥ 0.875rem.`,
        });
      if (
        /\b(animation\s*:|@keyframes|scroll-behavior\s*:\s*smooth)/.test(
          code,
        ) &&
        !/prefers-reduced-motion/.test(text)
      )
        findings.push({
          level: "warn",
          rule: "mouvement",
          at,
          hint: "Entourer de @media (prefers-reduced-motion: no-preference).",
        });
      if (
        path.basename(file) !== "variables.scss" &&
        /\b(color|background(?:-color)?)\s*:\s*(#[0-9a-f]{3,8}|rgba?\()/i.test(
          code,
        )
      ) {
        hardcoded.count += 1;
        hardcoded.first ??= at;
      }
    });
    if (hardcoded.count)
      findings.push({
        level: "info",
        rule: "couleur-hors-variable",
        at: hardcoded.first,
        hint: `${hardcoded.count} couleur(s) en dur dans ce fichier : contraste non vérifié par le script, préférer une variable.`,
      });
    const hovers = (text.match(/:hover/g) || []).length;
    const focuses = (text.match(/:focus/g) || []).length;
    if (hovers > 0 && focuses === 0)
      findings.push({
        level: "warn",
        rule: "survol-sans-focus",
        at: rel,
        hint: `${hovers} :hover sans :focus / :focus-visible équivalent.`,
      });
  }
  return findings;
};

// ---------- sortie ----------

const theme = process.argv[2];
const asJson = process.argv.includes("--json");
if (!theme || theme.startsWith("--")) {
  console.error("Usage : node scripts/a11y-check.js <theme|base> [--json]");
  process.exit(2);
}
if (!fs.existsSync(path.join(root, theme, "src/scss"))) {
  console.error(`Thème introuvable : ${theme}`);
  process.exit(2);
}

const contrastResults = checkContrast(resolveVariables(theme));
const lint = lintTheme(theme);
const failures = contrastResults.filter((r) => r.status === "échec");

if (asJson) {
  console.log(
    JSON.stringify({ theme, contrast: contrastResults, lint }, null, 2),
  );
} else {
  console.log(`\nAccessibilité — ${theme} (WCAG 2.1 AA)\n`);
  for (const r of contrastResults) {
    if (r.status === "ignoré") continue;
    const mark = { ok: "✔", échec: "✘", "à vérifier": "?" }[r.status];
    console.log(
      `${mark} ${r.label.padEnd(36)} ${String(r.ratio).padStart(5)}:1  (min ${r.required})  $${r.fgRef} ${r.fg} / ${r.bg}`,
    );
    if (r.suggestion)
      console.log(`    → proposition pour $${r.fgRef} : ${r.suggestion}`);
    if (r.note) console.log(`    ! ${r.note}`);
  }
  const ignored = contrastResults.filter((r) => r.status === "ignoré");
  if (ignored.length)
    console.log(
      `\n${ignored.length} paire(s) ignorée(s) : valeur non-couleur (initial, inherit…).`,
    );

  if (lint.length) {
    console.log("\nLint SCSS");
    for (const f of lint)
      console.log(
        `${f.level === "warn" ? "⚠" : "·"} ${f.rule.padEnd(22)} ${f.at}\n    ${f.hint}`,
      );
  }
  console.log(
    `\n${failures.length} échec(s) de contraste, ${lint.filter((f) => f.level === "warn").length} avertissement(s) lint.`,
  );
  console.log(
    "Le script ne voit pas : ordre des titres, états focus réels, texte sur image, zoom 200 %. Voir la checklist du skill.",
  );
}
process.exit(failures.length ? 1 : 0);
