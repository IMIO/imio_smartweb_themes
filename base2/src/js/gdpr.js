/**
 * Bandeau cookies : il est fixe en bas de l'écran et masquait l'élément qui
 * reçoit le focus clavier (WCAG 2.4.11). Tant qu'il est affiché, sa hauteur
 * est exposée dans --sw-gdpr-height (views/_gdpr.scss) : elle est réservée
 * sous la page et en bas de la zone de défilement, et le navigateur fait
 * défiler l'élément focalisé au-dessus du bandeau.
 */
function init() {
  const banner = document.getElementById("gdpr-consent-banner");
  if (!banner) return;
  const root = document.documentElement;
  const sync = () => {
    const visible = banner.isConnected && banner.getClientRects().length > 0;
    if (visible) {
      root.style.setProperty("--sw-gdpr-height", `${banner.offsetHeight}px`);
    } else {
      root.style.removeProperty("--sw-gdpr-height");
    }
  };
  new ResizeObserver(sync).observe(banner);
  new MutationObserver(sync).observe(document.body, { childList: true });
  sync();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
