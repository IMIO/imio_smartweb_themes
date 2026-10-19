/**
 * Section Contact : l'horaire du jour (lien href="#") ouvre le tableau de la
 * semaine (JS du core, classe .table_schedule--active). Il devient un bouton
 * qui annonce son état (aria-expanded) et le tableau qu'il contrôle.
 */
function enhanceSchedule(link, index) {
  const table = link.parentElement?.querySelector(".table_schedule");
  if (!table) return;
  table.id ||= `sw-schedule-${index}`;
  link.setAttribute("role", "button");
  link.setAttribute("aria-controls", table.id);
  const sync = () =>
    link.setAttribute(
      "aria-expanded",
      table.classList.contains("table_schedule--active") ? "true" : "false",
    );
  sync();
  new MutationObserver(sync).observe(table, {
    attributes: true,
    attributeFilter: ["class"],
  });
  // Un bouton s'active aussi à la barre d'espace.
  link.addEventListener("keydown", (event) => {
    if (event.key !== " ") return;
    event.preventDefault();
    link.click();
  });
}

function init() {
  document.querySelectorAll(".opening_informations").forEach(enhanceSchedule);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
