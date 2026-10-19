/**
 * Outils communs aux scripts de test de base2 : contexte de navigateur qui
 * sert le dist/ du thème testé à la place de celui du thème actif dans Plone.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export const DEFAULTS = {
  dist: path.join(ROOT, "base2/dist"),
  active: "base",
  site: "http://localhost:8080/Plone",
  gdpr: false,
};

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

/**
 * Contexte de navigateur prêt pour les tests.
 * opts : { dist, active, site, gdpr } ; width ; auth (admin:admin).
 */
export async function newThemedContext(browser, opts, { width, auth = false }) {
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
  return context;
}
