import "./scss/main.scss";
// import "https://unpkg.com/scrollreveal";
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
    eventsSwiper.params.spaceBetween = 30;
    (eventsSwiper.params.speed = 1000), eventsSwiper.update();
  }

  ScrollReveal().reveal(".swiper-banner-content *", {
    delay: 500,
    duration: 1500,
    distance: "20%",
    origin: "bottom",
    interval: 100,
    opacity: 0,
  });

  ScrollReveal().reveal(".text *", {
    delay: 300,
    duration: 1000,
    distance: "20%",
    origin: "bottom",
    interval: 100,
  });

  ScrollReveal().reveal("figure", {
    delay: 400,
    duration: 1500,
    distance: "20%",
    origin: "bottom",
    interval: 100,
  });

  ScrollReveal().reveal(".section-title", {
    delay: 500,
    duration: 1500,
    distance: "20%",
    origin: "bottom",
  });

  ScrollReveal().reveal(".blocsx3 a", {
    delay: 300,
    distance: "100%",
    origin: "bottom",
    interval: 100,
  });

  ScrollReveal().reveal(".bloc-app li", {
    delay: 400,
    duration: 1200,
    distance: "100%",
    origin: "bottom",
    interval: 100,
  });

  ScrollReveal().reveal(".bloc-temoignages .swiper-slide-active *", {
    delay: 500,
    duration: 1500,
    distance: "20%",
    origin: "bottom",
    interval: 100,
    opacity: 0,
  });
});
