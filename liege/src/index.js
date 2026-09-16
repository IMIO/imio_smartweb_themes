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
  if ($(".bloc-actu .swiper").length > 0) {
    var newsSwiper = $(".bloc-actu .swiper")[0].swiper;
    newsSwiper.params.spaceBetween = 40;
    newsSwiper.update();
  }
  if ($(".sectionevents .swiper").length > 0) {
    var eventsSwiper = $(".sectionevents .swiper")[0].swiper;
    eventsSwiper.params.spaceBetween = 40;
    eventsSwiper.params.speed = 1000;
    eventsSwiper.update();
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

  // Réduction de la barre magenta au scroll : activée dès que le titre
  // atteint la moitié du viewport, désactivée seulement quand il en sort
  // presque entièrement.
  const animatedTitles = document.querySelectorAll(
    ".a-la-une .section-title, .bloc-actu .section-title, .sectionevents .section-title",
  );
  if (animatedTitles.length > 0) {
    const updateTitleBars = () => {
      const viewportHeight = window.innerHeight;
      animatedTitles.forEach((title) => {
        const rect = title.getBoundingClientRect();
        const reachedMiddle = rect.top <= viewportHeight / 2;
        const hasLeftViewport = rect.bottom <= 0 || rect.top >= viewportHeight;
        title.classList.toggle("in-view", reachedMiddle && !hasLeftViewport);
      });
    };
    window.addEventListener("scroll", updateTitleBars);
    updateTitleBars();
  }

  // reveal

  ScrollReveal().reveal(".sr-only span", {
    delay: 300,
    duration: 1000,
    distance: "20%",
    origin: "bottom",
    interval: 100,
    opacity: 0,
  });

  ScrollReveal().reveal(".quick-access .table_display", {
    delay: 300,
    duration: 1000,
    distance: "20%",
    origin: "bottom",
    interval: 100,
    opacity: 0,
  });

  ScrollReveal().reveal(".a-la-une .swiper", {
    delay: 300,
    duration: 1000,
    distance: "15%",
    origin: "bottom",
    interval: 10,
    opacity: 0,
  });

  ScrollReveal().reveal(".a-la-une  .section-title", {
    delay: 200,
    duration: 700,
    distance: "5%",
    origin: "left",
    interval: 10,
    opacity: 0,
  });

  ScrollReveal().reveal(".sectionnews .swiper", {
    delay: 300,
    duration: 1000,
    distance: "15%",
    origin: "bottom",
    interval: 10,
    opacity: 0,
  });

  ScrollReveal().reveal(".sectionnews .section-title", {
    delay: 200,
    duration: 700,
    distance: "5%",
    origin: "right",
    interval: 10,
    opacity: 0,
  });

  ScrollReveal().reveal(".sectionevents .swiper", {
    delay: 300,
    duration: 1000,
    distance: "15%",
    origin: "bottom",
    interval: 10,
    opacity: 0,
  });

  ScrollReveal().reveal(".sectionevents .section-title", {
    delay: 200,
    duration: 700,
    distance: "5%",
    origin: "left",
    interval: 10,
    opacity: 0,
  });
});
