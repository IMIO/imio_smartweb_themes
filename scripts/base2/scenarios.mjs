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

  // Les diapositives du site local n'ont pas de texte : le balisage du core
  // (slide/view.pt) est ajouté côté navigateur pour voir l'encadré.
  async hero(page, shot, log) {
    await page.evaluate(() => {
      const slide = document.querySelector(
        ".smartweb_herobanner .section-slide",
      );
      slide.insertAdjacentHTML(
        "beforeend",
        `<div class="swiper-banner-content-wrapper container"><div class="swiper-banner-content">
          <span class="swiper-banner-title">Bienvenue sur le site de la commune</span>
          <div class="swiper-banner-description"><p class="lead rich_description">Démarches, actualités, agenda : tout ce qu'il faut savoir sur la vie communale.</p></div>
          <span class="swiper-banner-link"><a href="#">Découvrir la commune</a></span>
        </div></div>`,
      );
    });
    await page.waitForTimeout(200);
    log("bandeau", {
      height: await page.evaluate(
        () => document.querySelector(".smartweb_herobanner").offsetHeight,
      ),
    });
    await shot("bandeau-avec-texte");
  },

  async "hero-mobile"(page, shot, log) {
    await SCENARIOS.hero(page, shot, log);
  },

  // Variantes de la section Texte (classes du core) : la section locale est
  // dupliquée côté navigateur avec chaque combinaison position / taille.
  async "text-variants"(page, shot, log) {
    const variants = await page.evaluate(() => {
      const src = document.querySelector(".sortable-section.sectiontext");
      const combos = [
        ["figure-left", "figure-section_text"],
        ["figure-right", "figure-section_text"],
        ["figure-left", "figure-section_text_container"],
        ["figure-top", "figure-section_text_container"],
        ["figure-bottom", "figure-section_text_viewport"],
      ];
      const done = [];
      let after = src;
      for (const [pos, size] of combos) {
        const clone = src.cloneNode(true);
        const body = clone.querySelector(".body-section");
        body.className = `body-section ${pos} ${size}`;
        const label = document.createElement("p");
        label.className = "h4";
        label.textContent = `Variante : ${pos} / ${size}`;
        clone.prepend(label);
        after.after(clone);
        after = clone;
        done.push(`${pos} ${size}`);
      }
      src.scrollIntoView();
      return done;
    });
    log("variantes ajoutées", { variants });
    const box = await page.evaluate(() => {
      const all = document.querySelectorAll(".sortable-section.sectiontext");
      const first = all[0].getBoundingClientRect();
      const last = all[all.length - 1].getBoundingClientRect();
      return { y: first.top + scrollY, height: last.bottom - first.top };
    });
    const width = page.viewportSize().width;
    for (let y = box.y, i = 1; y < box.y + box.height; y += 1000, i++) {
      await page.screenshot({
        path: `${shot.dir}/text-variants-${width}-${i}.png`,
        fullPage: true,
        clip: {
          x: 0,
          y,
          width,
          height: Math.min(1000, box.y + box.height - y),
        },
      });
    }
  },

  async "text-variants-mobile"(page, shot, log) {
    await SCENARIOS["text-variants"](page, shot, log);
  },

  // Classes admin (sections/_admin.scss) posées sur les sections de
  // l'accueil, comme le ferait un Manager. Une capture par section.
  async "admin-classes"(page, shot, log) {
    const applied = await page.evaluate(() => {
      const plan = [
        [".sectionlinks.quick-access", "fond-alterne pleine-largeur"],
        [".sectionnews", "a-la-une fond-sombre pleine-largeur titre-centre"],
        [".sectionevents", "fond-accent encadre"],
        [".sectionlinks.partenaires", "encadre titre-centre espace-reduit"],
        [".sectionfiles", "titre-masque"],
      ];
      return plan.map(([sel, classes]) => {
        const el = document.querySelector(`.sortable-section${sel}`);
        if (!el) return `${sel} : absente`;
        el.classList.add(...classes.split(" "));
        el.dataset.swShot = "1";
        return `${sel} + ${classes}`;
      });
    });
    log("classes ajoutées", { applied });
    const width = page.viewportSize().width;
    // Capture découpée (pas d'elementHandle.screenshot : les carrousels ne
    // sont jamais « stables »).
    const boxes = await page.evaluate(() =>
      [...document.querySelectorAll("[data-sw-shot]")].map((el) => {
        const r = el.getBoundingClientRect();
        return { y: r.top + scrollY, height: r.height };
      }),
    );
    for (const [i, box] of boxes.entries()) {
      await page.screenshot({
        path: `${shot.dir}/admin-classes-${width}-${i + 1}.png`,
        fullPage: true,
        clip: { x: 0, y: box.y - 16, width, height: box.height + 32 },
      });
    }
  },

  async "admin-classes-mobile"(page, shot, log) {
    await SCENARIOS["admin-classes"](page, shot, log);
  },

  // Section Contact : vide sur le site local (annuaire externe). Une fiche
  // reprenant le balisage du core (contact/macros.pt) est injectée.
  async contact(page, shot, log) {
    await page.evaluate(() => {
      const section = document.querySelector(
        ".sortable-section.sectioncontact",
      );
      section.innerHTML = `<a id="section-demo-contact"></a>
<div class="container section-container section-contact" id="container-section-demo-contact">
  <div class="row nb-contact-by-line-1">
    <div class="col body-section contact-type-organization" id="body-section-demo-contact">
      <div class="contact_titles"><h2>Administration communale</h2><div class="contact_subtitle">Service Population - État civil</div></div>
      <div class="contact_informations">
        <h3 class="informations">Contact</h3>
        <ul class="contact_informations_genral">
          <li class="work">Accueil <a href="tel:+3267347311">067 34 73 11</a></li>
          <li class="work"><a href="mailto:population@commune.be">population@commune.be</a></li>
        </ul>
        <ul class="contact_informations_social">
          <li class="facebook"><a href="https://facebook.com" title="Facebook" target="_blank"><i class="bi bi-facebook"></i><span class="sr-only">https://facebook.com/commune</span></a></li>
          <li class="website"><a href="https://www.commune.be" title="Site web" target="_blank"><span>https://www.commune.be</span></a></li>
        </ul>
      </div>
      <div class="address">
        <div class="contact_address"><h3 class="address">Adresse</h3><span class="street">Place Verte 32</span><span class="entity">7060 Soignies</span><span class="country">Belgique</span></div>
        <div class="itinerary"><a href="https://www.google.com/maps" target="_blank">Itinéraire</a></div>
      </div>
      <div class="schedule">
        <h3 class="schedule-title">Horaire</h3>
        <div><a class="opening_informations" href="#">Ouvert aujourd'hui de 8h30 à 12h</a>
          <table class="table_schedule">
            <tr><td>Lundi</td><td>8h30 - 12h00</td></tr><tr><td>Mardi</td><td>8h30 - 12h00 / 13h30 - 16h00</td></tr>
            <tr><td>Mercredi</td><td>8h30 - 12h00</td></tr><tr><td>Jeudi</td><td>8h30 - 12h00</td></tr><tr><td>Vendredi</td><td>8h30 - 12h00</td></tr>
          </table></div>
      </div>
      <div class="contact_description">Le service est fermé les jours fériés.</div>
    </div>
  </div>
</div>`;
      // Comportement du core (view.js) : bascule du tableau
      section
        .querySelector(".opening_informations")
        .addEventListener("click", (e) => {
          e.preventDefault();
          e.currentTarget.parentElement
            .querySelector(".table_schedule")
            .classList.toggle("table_schedule--active");
        });
      section.scrollIntoView();
    });
    await page.waitForTimeout(200);
    const shotSection = async (label) => {
      const el = await page.$(".sortable-section.sectioncontact");
      await el.screenshot({
        path: `${shot.dir}/contact-${page.viewportSize().width}-${label}.png`,
      });
    };
    await shotSection("ferme");
    await page.click(".opening_informations");
    await page.waitForTimeout(100);
    await shotSection("horaire-ouvert");
  },

  async "contact-mobile"(page, shot, log) {
    await SCENARIOS.contact(page, shot, log);
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
  hero: 1280,
  contact: 1280,
  "contact-mobile": 390,
  "text-variants": 1280,
  "text-variants-mobile": 390,
  "hero-mobile": 390,
  "admin-classes": 1280,
  "admin-classes-mobile": 390,
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
    shot.dir = opts.out;
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
