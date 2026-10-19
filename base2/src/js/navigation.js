/**
 * Navigation principale et de sous-site : compléments d'accessibilité au JS
 * du core (imio.smartweb.core, browser/static/src/view.js), qui ouvre et
 * ferme les sous-menus avec la classe .show-nav.
 *
 * - aria-expanded sur les entrées qui ouvrent un sous-menu ;
 * - aria-current="page" sur l'entrée de la page en cours ;
 * - Échap ferme le niveau ouvert (puis le menu mobile) et rend le focus ;
 * - « Retour » (lien sans href) devient un bouton utilisable au clavier ;
 * - le bouton du menu mobile pointe vers le bon panneau (aria-controls).
 */
const NAV_SELECTORS = ["#portal-globalnav", "#subsite-navigation"];

function syncExpanded(item) {
  const link = item.querySelector(":scope > a");
  if (link) {
    link.setAttribute(
      "aria-expanded",
      item.classList.contains("show-nav") ? "true" : "false",
    );
  }
}

function enhanceNav(nav) {
  nav.querySelectorAll("li.has_subtree").forEach(syncExpanded);
  new MutationObserver((mutations) => {
    mutations.forEach(({ target }) => {
      if (target.matches("li.has_subtree")) syncExpanded(target);
    });
  }).observe(nav, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  nav.querySelectorAll(".prev-nav").forEach((back) => {
    back.setAttribute("role", "button");
    back.setAttribute("tabindex", "0");
    back.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      const item = back.closest("li.show-nav");
      back.click();
      item?.querySelector(":scope > a")?.focus();
    });
  });
}

function markCurrent(nav) {
  nav
    .querySelectorAll("li.current > a")
    .forEach((link) => link.setAttribute("aria-current", "page"));
}

function closeDeepestLevel(navs) {
  for (const nav of navs) {
    const open = nav.querySelectorAll("li.show-nav");
    if (!open.length) continue;
    // Une seule branche est ouverte : le dernier élément est le plus profond.
    const deepest = open[open.length - 1];
    if (open.length > 1) {
      deepest.classList.remove("show-nav");
    } else {
      // Fermeture complète par le core (voile, inert, classes).
      nav.querySelector(".close-nav")?.click();
    }
    deepest.querySelector(":scope > a")?.focus();
    return true;
  }
  return false;
}

function init() {
  const navs = NAV_SELECTORS.map((s) => document.querySelector(s)).filter(
    Boolean,
  );
  navs.forEach(enhanceNav);

  const toggler = document.querySelector(
    '.navbar-toggler[data-bs-target="#portal-globalnav-collapse"]',
  );
  toggler?.setAttribute("aria-controls", "portal-globalnav-collapse");

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (closeDeepestLevel(navs)) {
      event.preventDefault();
      return;
    }
    const collapse = document.getElementById("portal-globalnav-collapse");
    if (toggler && collapse?.classList.contains("show")) {
      toggler.click();
      toggler.focus();
    }
  });

  // pat-navigationmarker pose .current une fois les patterns initialisés.
  window.addEventListener("load", () => navs.forEach(markCurrent));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
