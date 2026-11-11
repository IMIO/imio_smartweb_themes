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
    eventsSwiper.params.spaceBetween = 30;
    (eventsSwiper.params.speed = 1000), eventsSwiper.update();
  }

  // For banner

  let checkBanner = document.querySelector("#portal-header #banner");
  let headerCustom = document.getElementById("portal-header");

  if (checkBanner != null) {
    headerCustom.classList.add("header-custom");
  }

  document.querySelectorAll(".intro h2").forEach((h2) => {
    h2.innerHTML = h2.innerHTML.replace(/villages/i, "<strong>$&</strong>");
  });

  document
    .querySelectorAll(".sectionlinks.quick-access .section-title")
    .forEach((title) => {
      title.innerHTML = title.innerHTML.replace(/clic/i, "<strong>$&</strong>");
    });

  document.querySelectorAll(".sectionnews .section-title").forEach((title) => {
    title.innerHTML = title.innerHTML.replace(
      /actualit[ée]/i,
      "<strong>$&</strong>",
    );
  });

  document
    .querySelectorAll(".sectionevents .section-title")
    .forEach((title) => {
      title.innerHTML = title.innerHTML.replace(
        /[ée]v[ée]nements/i,
        "<strong>$&</strong>",
      );
    });
});
