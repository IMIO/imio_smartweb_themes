#!/usr/bin/env node
/**
 * Contrôle visuel et d'accessibilité d'un thème sur le Plone local, sans
 * l'activer : la page garde le Diazo du thème actif, mais les fichiers
 * `++theme++<actif>/dist/*` qu'elle demande sont servis depuis le `dist/` du
 * thème testé (et l'attribut `integrity` du script de thème est retiré).
 *
 *   node scripts/base2/check.mjs [options]
 *
 * Options :
 *   --dist=<dossier>     dist/ à servir (défaut : base2/dist)
 *   --active=<thème>     thème actif dans Plone (défaut : base)
 *   --site=<url>         défaut : http://localhost:8080/Plone
 *   --pages=a,b          pages à contrôler (défaut : toutes, voir PAGES)
 *   --widths=390,1280    largeurs (défaut : 390,768,1024,1280)
 *   --auth               ajoute les pages vues connecté (admin:admin)
 *   --focus              parcourt les 40 premiers éléments au clavier
 *   --gdpr               garde le bandeau cookies (masqué par défaut)
 *   --no-shots           pas de captures
 *   --out=<dossier>      défaut : /tmp/base2-checks/<horodatage>
 *
 * Produit report.json et report.md dans le dossier de sortie, plus une
 * capture pleine page par page et par largeur.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const AXE_PATH = require.resolve("axe-core/axe.min.js");

const PAGES = {
  home: "/",
  folder: "/je-suis",
  faceted: "/je-trouve/demarches-infos-pratiques",
  news: "/actualites",
  events: "/agenda",
  directory: "/annuaire",
  search: "/@@search?SearchableText=commune",
  notfound: "/page-inexistante-base2",
  accessibility: "/accessibility-info",
  contact: "/contact-info",
  sitemap: "/sitemap",
};
const AUTH_PAGES = {
  "auth-home": "/",
  "auth-edit": "/home-page/edit",
  "auth-contents": "/folder_contents",
};
const TILE = 1000;
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const MIME = {
  ".css": "text/css",
  ".js": "application/javascript",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};

function parseArgs(argv) {
  const opts = {
    dist: path.join(ROOT, "base2/dist"),
    active: "base",
    site: "http://localhost:8080/Plone",
    widths: [390, 768, 1024, 1280],
    pages: null,
    auth: false,
    focus: false,
    gdpr: false,
    shots: true,
    out: null,
  };
  for (const arg of argv) {
    const [key, value] = arg.replace(/^--/, "").split("=");
    if (key === "dist") opts.dist = path.resolve(value);
    else if (key === "active") opts.active = value;
    else if (key === "site") opts.site = value.replace(/\/$/, "");
    else if (key === "widths") opts.widths = value.split(",").map(Number);
    else if (key === "pages") opts.pages = value.split(",");
    else if (key === "auth") opts.auth = true;
    else if (key === "focus") opts.focus = true;
    else if (key === "gdpr") opts.gdpr = true;
    else if (key === "no-shots") opts.shots = false;
    else if (key === "out") opts.out = path.resolve(value);
    else throw new Error(`Option inconnue : ${arg}`);
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  opts.out ||= path.join("/tmp/base2-checks", stamp);
  return opts;
}

// Sert le dist/ du thème testé à la place de celui du thème actif.
async function substituteTheme(context, opts) {
  const marker = `/++theme++${opts.active}/dist/`;
  await context.route(
    (url) => url.pathname.includes(marker),
    async (route) => {
      const url = new URL(route.request().url());
      const rel = decodeURIComponent(url.pathname.split(marker)[1]);
      const file = path.join(opts.dist, rel);
      if (!file.startsWith(opts.dist) || !fs.existsSync(file)) {
        return route.fulfill({ status: 404, body: "" });
      }
      return route.fulfill({
        status: 200,
        contentType: MIME[path.extname(file)] || "application/octet-stream",
        body: fs.readFileSync(file),
      });
    },
  );
  // Le hash SRI calculé par Plone ne correspond pas au fichier substitué.
  await context.route(
    (url) => url.href.startsWith(opts.site),
    async (route) => {
      if (route.request().resourceType() !== "document")
        return route.fallback();
      const response = await route.fetch({ maxRedirects: 0 });
      const type = response.headers()["content-type"] || "";
      if (!type.includes("text/html")) return route.fulfill({ response });
      const html = (await response.text()).replace(/<script\b[^>]*>/g, (tag) =>
        tag.includes("++theme++")
          ? tag.replace(/\sintegrity="[^"]*"/, "")
          : tag,
      );
      return route.fulfill({ response, body: html });
    },
  );
}

// Plan des titres tel que l'exposent les technologies d'assistance.
function headingOutline() {
  const hidden = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden" || n.hidden)
        return true;
      if (n.getAttribute("aria-hidden") === "true") return true;
    }
    return false;
  };
  const srOnly = (el) => {
    const r = el.getBoundingClientRect();
    return r.width <= 1 && r.height <= 1;
  };
  const items = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")]
    .filter((h) => !hidden(h))
    .map((h) => ({
      level: Number(h.tagName[1]),
      text: h.textContent.trim().replace(/\s+/g, " ").slice(0, 70),
      sr: srOnly(h),
      empty: !h.textContent.trim(),
    }));
  const jumps = [];
  for (let i = 1; i < items.length; i++) {
    if (items[i].level > items[i - 1].level + 1) {
      jumps.push(
        `h${items[i - 1].level} → h${items[i].level} « ${items[i].text} »`,
      );
    }
  }
  return {
    items,
    h1: items.filter((h) => h.level === 1).length,
    jumps,
    empty: items.filter((h) => h.empty).length,
  };
}

// Cibles interactives de moins de 24 px (WCAG 2.5.8), hors liens dans le texte.
function smallTargets() {
  const selector =
    'a[href], button, input:not([type=hidden]), select, textarea, [role=button], [tabindex]:not([tabindex="-1"])';
  const out = [];
  for (const el of document.querySelectorAll(selector)) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (!r.width || !r.height || cs.visibility === "hidden") continue;
    if (r.width <= 1 && r.height <= 1) continue; // sr-only
    if (r.width >= 24 && r.height >= 24) continue;
    if (cs.display === "inline") {
      const parentText = el.parentElement?.textContent.trim().length || 0;
      if (parentText > el.textContent.trim().length + 5) continue; // dans une phrase
    }
    out.push({
      target: el.id
        ? `#${el.id}`
        : `${el.tagName.toLowerCase()}.${[...el.classList].join(".")}`,
      size: `${Math.round(r.width)}×${Math.round(r.height)}`,
      text: (el.textContent || el.getAttribute("aria-label") || "")
        .trim()
        .slice(0, 40),
    });
  }
  return out;
}

async function checkFocus(page, max = 40) {
  const issues = [];
  await page.evaluate(() => document.activeElement?.blur());
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const r = el.getBoundingClientRect();
      const cx = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1);
      const cy = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
      const top = document.elementFromPoint(cx, cy);
      return {
        target: el.id
          ? `#${el.id}`
          : `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join(".")}`,
        text: (el.textContent || el.getAttribute("aria-label") || "")
          .trim()
          .replace(/\s+/g, " ")
          .slice(0, 40),
        visible:
          r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight,
        obscured: !!top && top !== el && !el.contains(top) && !top.contains(el),
        rect: { x: r.left, y: r.top, width: r.width, height: r.height },
      };
    });
    if (!info) continue;
    if (!info.visible) {
      issues.push({ ...info, problem: "élément focalisé invisible" });
      continue;
    }
    if (info.obscured)
      issues.push({ ...info, problem: "focus masqué par un autre élément" });
    const pad = 6;
    const clip = {
      x: Math.max(info.rect.x - pad, 0),
      y: Math.max(info.rect.y - pad, 0),
      width: info.rect.width + pad * 2,
      height: info.rect.height + pad * 2,
    };
    const focused = await page.screenshot({ clip });
    await page.evaluate(() => {
      window.__focused = document.activeElement;
      document.activeElement.blur();
    });
    const blurred = await page.screenshot({ clip });
    await page.evaluate(() => window.__focused?.focus({ preventScroll: true }));
    if (focused.equals(blurred))
      issues.push({ ...info, problem: "aucun indicateur de focus visible" });
  }
  return issues;
}

async function checkPage(browser, opts, name, url, width, auth) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    // Plone ne réclame jamais d'authentification sur une page publique :
    // l'en-tête est envoyé d'emblée.
    extraHTTPHeaders: auth
      ? {
          Authorization: `Basic ${Buffer.from("admin:admin").toString("base64")}`,
        }
      : {},
    locale: "fr-BE",
    // Sans défilement doux, l'élément focalisé est déjà à l'écran quand on le
    // mesure.
    reducedMotion: "reduce",
  });
  await substituteTheme(context, opts);
  if (!opts.gdpr) {
    // Le bandeau cookies couvre le bas de chaque page et prend le focus.
    await context.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        const style = document.createElement("style");
        style.textContent = "#gdpr-consent-banner{display:none!important}";
        document.head.append(style);
      });
    });
  }
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  const result = { name, url, width };
  try {
    const response = await page.goto(url, {
      waitUntil: "load",
      timeout: 60000,
    });
    result.status = response?.status();
    await page
      .waitForLoadState("networkidle", { timeout: 15000 })
      .catch(() => {});
    await page.waitForTimeout(500);
    if (opts.shots) {
      result.screenshot = path.join(opts.out, `${name}-${width}.png`);
      await page.screenshot({ path: result.screenshot, fullPage: true });
      // Bandes de 1000 px, plus faciles à relire qu'une capture de 7000 px.
      const height = await page.evaluate(
        () => document.documentElement.scrollHeight,
      );
      result.tiles = [];
      for (let y = 0, i = 1; y < height && i <= 12; y += TILE, i++) {
        const tile = path.join(
          opts.out,
          `${name}-${width}-${String(i).padStart(2, "0")}.png`,
        );
        const clip = { x: 0, y, width, height: Math.min(TILE, height - y) };
        await page.screenshot({ path: tile, fullPage: true, clip });
        result.tiles.push(tile);
      }
    }
    await page.addScriptTag({ path: AXE_PATH });
    const axe = await page.evaluate(
      (tags) =>
        window.axe.run(document, {
          runOnly: { type: "tag", values: tags },
          resultTypes: ["violations"],
        }),
      AXE_TAGS,
    );
    result.axe = axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      count: v.nodes.length,
      targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
    }));
    result.headings = await page.evaluate(headingOutline);
    result.smallTargets = await page.evaluate(smallTargets);
    if (opts.focus && (width === 390 || width === 1280))
      result.focus = await checkFocus(page);
  } catch (e) {
    result.error = e.message;
  }
  result.errors = errors;
  await context.close();
  return result;
}

function summarize(results) {
  const lines = [
    "| Page | Largeur | HTTP | Violations axe (nœuds) | h1 | Sauts de titre | Cibles < 24 px | Focus | Erreurs JS |",
    "|---|---|---|---|---|---|---|---|---|",
  ];
  for (const r of results) {
    const axe = r.axe
      ? r.axe.map((v) => `${v.id} (${v.count})`).join(", ") || "aucune"
      : r.error || "?";
    lines.push(
      `| ${r.name} | ${r.width} | ${r.status ?? "?"} | ${axe} | ${r.headings?.h1 ?? "?"} | ${r.headings?.jumps.length ?? "?"} | ${r.smallTargets?.length ?? "?"} | ${r.focus ? r.focus.length : "–"} | ${r.errors.length} |`,
    );
  }
  return lines.join("\n");
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(opts.dist))
    throw new Error(`dist introuvable : ${opts.dist}`);
  fs.mkdirSync(opts.out, { recursive: true });
  const pages = Object.entries(PAGES).filter(
    ([n]) => !opts.pages || opts.pages.includes(n),
  );
  const authPages = opts.auth
    ? Object.entries(AUTH_PAGES).filter(
        ([n]) => !opts.pages || opts.pages.includes(n),
      )
    : [];
  const browser = await chromium.launch();
  const results = [];
  for (const [name, p] of [...pages, ...authPages]) {
    for (const width of opts.widths) {
      const auth = name.startsWith("auth-");
      process.stdout.write(`\r${name} @ ${width}px…                    `);
      results.push(
        await checkPage(browser, opts, name, opts.site + p, width, auth),
      );
    }
  }
  await browser.close();
  process.stdout.write("\n");
  fs.writeFileSync(
    path.join(opts.out, "report.json"),
    JSON.stringify(results, null, 2),
  );
  const md = `# Contrôle ${path.relative(ROOT, opts.dist) || opts.dist}\n\n${summarize(results)}\n`;
  fs.writeFileSync(path.join(opts.out, "report.md"), md);
  console.log(md);
  console.log(`Rapport : ${opts.out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
