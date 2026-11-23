import "./scss/main.scss";
import "@imiobe/plonetheme-smartweb-base/src/js/nav-submenu";
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
  if ($(".sectionnews .swiper").length > 0) {
    var newsSwiper = $(".sectionnews .swiper")[0].swiper;
    newsSwiper.params.spaceBetween = 30;
    (newsSwiper.params.speed = 1000), newsSwiper.update();
  }
  if ($(".sectionevents .swiper").length > 0) {
    var eventsSwiper = $(".sectionevents .swiper")[0].swiper;
    eventsSwiper.params.spaceBetween = 24; // écart entre cartes de la maquette
    (eventsSwiper.params.speed = 1000), eventsSwiper.update();
  }
  // Carrousels des sections de liens : même écart (24px) que leurs grilles
  $(".sectionlinks .swiper").each(function () {
    if (this.swiper) {
      this.swiper.params.spaceBetween = 24;
      this.swiper.update();
    }
  });

  // Largeur de la barre de défilement (utilisée par la bannière pleine largeur)
  function setScrollbarWidth() {
    document.documentElement.style.setProperty(
      "--scrollbar-width",
      window.innerWidth - document.documentElement.clientWidth + "px",
    );
  }
  setScrollbarWidth();
  window.addEventListener("resize", setScrollbarWidth);

  // For banner

  let checkBanner = document.querySelector("#portal-header #banner");
  let headerCustom = document.getElementById("portal-header");

  if (checkBanner != null) {
    headerCustom.classList.add("header-custom");
  }
});
