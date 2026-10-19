#!/usr/bin/env node
/**
 * Scénarios d'interaction sur le Plone local (même substitution de thème que
 * check.mjs) : captures de la fenêtre à chaque étape et journal des états
 * (aria-expanded, élément focalisé…).
 *
 *   node scripts/base2/scenarios.mjs [nom…] [--dist=…] [--out=…]
 *
 * Scénarios : nav-desktop, nav-keyboard, nav-tablet, nav-mobile, search,
 * skip-links (tous par défaut).
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { DEFAULTS, newThemedContext } from "./lib.mjs";

const state = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    const nav = document.querySelector("#portal-globalnav");
    return {
      focus: el
        ? `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}.${[...el.classList].join(".")} « ${(el.textContent || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 40)} »`
        : null,
      open: [...document.querySelectorAll("#portal-globalnav li.show-nav")].map(
        (li) => li.querySelector(":scope > a")?.textContent.trim(),
      ),
      expanded: [
        ...document.querySelectorAll("#portal-globalnav li.has_subtree > a"),
      ].map(
        (a) => `${a.textContent.trim()}=${a.getAttribute("aria-expanded")}`,
      ),
      navActivated: nav?.classList.contains("activated"),
      mask: document.querySelector(".mask-menu")?.classList.contains("in"),
      collapse: document
        .querySelector("#portal-globalnav-collapse")
        ?.classList.contains("show"),
      toggler: document
        .querySelector(".navbar-toggler")
        ?.getAttribute("aria-expanded"),
    };
  });

const SCENARIOS = {
  async "nav-desktop"(page, shot, log) {
    await shot("ferme");
    await page.click("#portal-globalnav li.has_subtree > a");
    await page.waitForTimeout(300);
    log("après clic sur la première rubrique", await state(page));
    await shot("rubrique-ouverte");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    log("après Échap", await state(page));
    await shot("apres-echap");
  },

  async "nav-keyboard"(page, shot, log) {
    const first = page.locator("#portal-globalnav li.has_subtree > a").first();
    await first.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    log("Entrée sur la rubrique", await state(page));
    for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
    log("3 tabulations dans le panneau", await state(page));
    await shot("focus-dans-panneau");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    log("Échap", await state(page));
  },

  async "nav-tablet"(page, shot, log) {
    log("état initial", await state(page));
    await shot("ferme");
    await page.click(".navbar-toggler");
    await page.waitForTimeout(500);
    log("menu ouvert", await state(page));
    await shot("menu-ouvert");
  },

  async "nav-mobile"(page, shot, log) {
    await shot("ferme");
    await page.click(".navbar-toggler");
    await page.waitForTimeout(500);
    log("menu ouvert", await state(page));
    await shot("menu-ouvert");
    await page.click("#portal-globalnav li.has_subtree > a");
    await page.waitForTimeout(300);
    log("rubrique ouverte", await state(page));
    await shot("rubrique-ouverte");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    log("Échap 1", await state(page));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    log("Échap 2", await state(page));
    await shot("apres-echap");
  },

  async search(page, shot, log) {
    await page.click("#search-link a");
    await page.waitForTimeout(1500);
    log("recherche ouverte", await state(page));
    await shot("ouverte");
  },

  async "skip-links"(page, shot, log) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(100);
    log("1re tabulation", await state(page));
    await shot("premier-lien");
  },
};

const WIDTHS = {
  "nav-desktop": 1280,
  "nav-keyboard": 1280,
  "nav-tablet": 820,
  "nav-mobile": 390,
  search: 1280,
  "skip-links": 1280,
};

async function main() {
  const args = process.argv.slice(2);
  const opts = { ...DEFAULTS, out: null, url: "/" };
  const names = [];
  for (const arg of args) {
    if (!arg.startsWith("--")) names.push(arg);
    else {
      const [key, value] = arg.slice(2).split("=");
      if (key === "dist") opts.dist = path.resolve(value);
      else if (key === "out") opts.out = path.resolve(value);
      else if (key === "url") opts.url = value;
      else throw new Error(`Option inconnue : ${arg}`);
    }
  }
  opts.out ||= "/tmp/base2-checks/scenarios";
  fs.mkdirSync(opts.out, { recursive: true });
  const browser = await chromium.launch();
  const journal = [];
  for (const name of names.length ? names : Object.keys(SCENARIOS)) {
    const context = await newThemedContext(browser, opts, {
      width: WIDTHS[name],
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(opts.site + opts.url, { waitUntil: "load" });
    await page.waitForLoadState("networkidle").catch(() => {});
    let step = 0;
    const shot = (label) =>
      page.screenshot({
        path: path.join(opts.out, `${name}-${++step}-${label}.png`),
      });
    const log = (label, data) =>
      journal.push({ scenario: name, label, ...data });
    try {
      await SCENARIOS[name](page, shot, log);
    } catch (e) {
      journal.push({ scenario: name, label: "ERREUR", error: e.message });
    }
    if (errors.length)
      journal.push({ scenario: name, label: "erreurs JS", errors });
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(
    path.join(opts.out, "journal.json"),
    JSON.stringify(journal, null, 2),
  );
  for (const entry of journal) {
    const { scenario, label, ...rest } = entry;
    console.log(`[${scenario}] ${label} :`, JSON.stringify(rest));
  }
  console.log(`Captures : ${opts.out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
