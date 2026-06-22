import "./scss/main.scss";
$(document).ready(function () {
  $("#portal-globalnav-collapse").on("show.bs.collapse", function () {
    document.body.classList.add("open-nav-overflow");
    document.documentElement.classList.add("open-nav-overflow");
  });
  $("#portal-globalnav-collapse").on("hidden.bs.collapse", function () {
    document.body.classList.remove("open-nav-overflow");
    document.documentElement.classList.remove("open-nav-overflow");
  });

  // For custom slider
  if ($(".bloc-actu .swiper").length > 0) {
    var newsSwiper = $(".bloc-actu .swiper")[0].swiper;
    newsSwiper.params.spaceBetween = 40;
    newsSwiper.update();
  }
  if ($(".sectionevents .swiper").length > 0) {
    var eventsSwiper = $(".sectionevents .swiper")[0].swiper;
    eventsSwiper.params.spaceBetween = 40;
    (eventsSwiper.params.speed = 1000), eventsSwiper.update();
  }

  // For banner

  let checkBanner = document.querySelector("#portal-header #banner");
  let headerCustom = document.getElementById("portal-header");

  if (checkBanner != null) {
    headerCustom.classList.add("header-custom");
  }

  // Sticky nav scroll
  const nav = document.getElementById("portal-header");
  if (nav) {
    window.addEventListener("scroll", () => {
      const atTop = window.scrollY === 0;
      nav.classList.toggle("sticky-is-top", atTop);
      nav.classList.toggle("sticky-demi-active", !atTop);
    });
  }

  // sub

  (function () {
    const NAV_ID = "subsite-navigation";
    const SHOW_CLASS = "show-nav";
    const HAS_CHILD_CLASS = "has-open-child"; // classe CSS ajoutée au parent pour désactiver son overflow
    const MIN_DEPTH = 2;
    const MAX_DEPTH = 4;
    const MOBILE_BP = 768;
    const GAP = -2;
    const EDGE_MARGIN = 8;
    const OVERLAY_OFFSET = 24;

    const isMobile = () => window.innerWidth < MOBILE_BP;

    function getDepth(el) {
      for (let d = MIN_DEPTH; d <= MAX_DEPTH; d++) {
        if (el.classList.contains(`nav-item-depth-${d}`)) return d;
      }
      return null;
    }

    // Ajoute has-open-child sur tous les panneaux ancêtres pour lever leur overflow
    function unlockParentOverflow(item, depth) {
      for (let d = depth - 1; d >= 1; d--) {
        const ancestor = item.closest(`.nav-dropdown-depth-${d}`);
        if (ancestor) ancestor.classList.add(HAS_CHILD_CLASS);
      }
    }

    // Retire has-open-child sur les panneaux ancêtres
    // seulement si aucun autre enfant show-nav n'est encore ouvert dedans
    function relockParentOverflow(item, depth) {
      for (let d = depth - 1; d >= 1; d--) {
        const ancestor = item.closest(`.nav-dropdown-depth-${d}`);
        if (!ancestor) continue;
        // Y a-t-il encore un enfant ouvert dans ce panneau ?
        const stillOpen = ancestor.querySelector(
          `.nav-item-depth-${d + 1}.${SHOW_CLASS}`,
        );
        if (!stillOpen) ancestor.classList.remove(HAS_CHILD_CLASS);
      }
    }

    function positionDepth1Panel(item) {
      if (isMobile()) return;
      const panel = item.querySelector(":scope > .nav-dropdown-depth-1");
      if (!panel) return;

      panel.style.left = "";
      panel.style.right = "";
      panel.style.visibility = "hidden";
      panel.style.display = "block";

      const itemRect = item.getBoundingClientRect();
      const panelW = panel.offsetWidth;
      const vpW = window.innerWidth;

      panel.style.visibility = "";
      panel.style.display = "";

      if (itemRect.left + panelW > vpW - EDGE_MARGIN) {
        panel.style.left = "auto";
        panel.style.right = "0";
      }
    }

    function resetDepth1Panel(item) {
      const panel = item.querySelector(":scope > .nav-dropdown-depth-1");
      if (panel) {
        panel.style.left = "";
        panel.style.right = "";
      }
    }

    function positionPanel(item, depth) {
      if (isMobile()) return;

      const panel = item.querySelector(`:scope > .nav-dropdown-depth-${depth}`);
      if (!panel) return;

      const parentPanel = item.closest(`.nav-dropdown-depth-${depth - 1}`);
      if (!parentPanel) return;

      // Lever l'overflow des panneaux parents AVANT de mesurer
      unlockParentOverflow(item, depth);

      // Mesure temporaire pour obtenir les vraies dimensions
      panel.style.visibility = "hidden";
      panel.style.display = "block";

      const parentRect = parentPanel.getBoundingClientRect();
      const panelW = panel.offsetWidth;
      const vpW = window.innerWidth;

      panel.style.visibility = "";
      panel.style.display = "";

      // --- Axe horizontal ---
      let left;
      const spaceRight = vpW - parentRect.right - GAP - EDGE_MARGIN;
      const spaceLeft = parentRect.left - GAP - EDGE_MARGIN;

      if (panelW <= spaceRight) {
        left = parentPanel.offsetWidth + GAP;
      } else if (panelW <= spaceLeft) {
        left = -(panelW + GAP);
      } else {
        // Superposition par-dessus le parent
        left = OVERLAY_OFFSET;
        panel.style.zIndex =
          (parseInt(getComputedStyle(parentPanel).zIndex) || 10) + 1;
      }

      panel.style.left = `${left}px`;
    }

    function resetPanel(item, depth) {
      const panel = item.querySelector(`:scope > .nav-dropdown-depth-${depth}`);
      if (panel) {
        panel.style.left = "";
        panel.style.zIndex = "";
      }
      relockParentOverflow(item, depth);
    }

    function init() {
      const nav = document.getElementById(NAV_ID);
      if (!nav) return;

      const observer = new MutationObserver((mutations) => {
        mutations.forEach(({ attributeName, target: item }) => {
          if (attributeName !== "class") return;

          if (item.classList.contains("nav-item-depth-1")) {
            if (item.classList.contains(SHOW_CLASS)) {
              positionDepth1Panel(item);
              nav.classList.add("activated");
            } else {
              resetDepth1Panel(item);
              if (!nav.querySelector(`.nav-item-depth-1.${SHOW_CLASS}`)) {
                nav.classList.remove("activated");
              }
            }
            return;
          }

          const depth = getDepth(item);
          if (!depth) return;

          if (item.classList.contains(SHOW_CLASS)) {
            positionPanel(item, depth);
          } else {
            resetPanel(item, depth);
          }
        });
      });

      // Observer depth-1
      nav.querySelectorAll(".nav-item-depth-1").forEach((item) => {
        observer.observe(item, { attributes: true });
        if (item.classList.contains(SHOW_CLASS)) positionDepth1Panel(item);
      });

      // Observer depth-2 à depth-N
      const selector = Array.from(
        { length: MAX_DEPTH - MIN_DEPTH + 1 },
        (_, i) => `.nav-item-depth-${MIN_DEPTH + i}`,
      ).join(", ");

      nav.querySelectorAll(selector).forEach((item) => {
        observer.observe(item, { attributes: true });
        const depth = getDepth(item);
        if (depth && item.classList.contains(SHOW_CLASS))
          positionPanel(item, depth);
      });

      window.addEventListener(
        "resize",
        () => {
          nav.querySelectorAll(".nav-item-depth-1").forEach((item) => {
            if (item.classList.contains(SHOW_CLASS)) positionDepth1Panel(item);
          });
          nav.querySelectorAll(selector).forEach((item) => {
            const depth = getDepth(item);
            if (depth && item.classList.contains(SHOW_CLASS))
              positionPanel(item, depth);
          });
        },
        { passive: true },
      );
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();

  // Boutons scroll subsite-navigation (mobile)
  (function () {
    const MOBILE_BP = 768;
    const SCROLL_AMOUNT = 150;
    console.log("init scroll buttons");

    const nav = document.getElementById("subsite-navigation");
    if (!nav) return;
    const ul = nav.querySelector(":scope > ul");
    if (!ul) return;

    const btnRight = document.createElement("button");
    btnRight.className =
      "sub-nav-scroll-btn sub-nav-scroll-btn--right is-hidden";
    btnRight.type = "button";
    btnRight.setAttribute("aria-label", "Défiler la navigation vers la droite");
    btnRight.setAttribute("aria-hidden", "true");
    nav.appendChild(btnRight);

    const btnLeft = document.createElement("button");
    btnLeft.className = "sub-nav-scroll-btn sub-nav-scroll-btn--left is-hidden";
    btnLeft.type = "button";
    btnLeft.setAttribute("aria-label", "Défiler la navigation vers la gauche");
    btnLeft.setAttribute("aria-hidden", "true");
    nav.appendChild(btnLeft);

    const updateVisibility = () => {
      if (window.innerWidth >= MOBILE_BP) {
        btnRight.classList.add("is-hidden");
        btnLeft.classList.add("is-hidden");
        return;
      }
      const overflows = ul.scrollWidth > ul.clientWidth;
      const atEnd = ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 2;
      const atStart = ul.scrollLeft <= 2;
      btnRight.classList.toggle("is-hidden", atEnd || !overflows);
      btnLeft.classList.toggle("is-hidden", atStart || !overflows);
    };

    btnRight.addEventListener("click", () => {
      ul.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
    });

    btnLeft.addEventListener("click", () => {
      ul.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
    });

    ul.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility, { passive: true });

    updateVisibility();
  })();
});
