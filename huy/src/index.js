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
  if ($(".sectionnews .swiper").length > 0) {
    // Update all swipers in sectionnews
    $(".sectionnews .swiper").each(function () {
      var newsSwiper = this.swiper;
      newsSwiper.params.spaceBetween = 25;
      newsSwiper.update();
    });
  }
  if ($(".sectionevents .swiper").length > 0) {
    $(".sectionevents .swiper").each(function () {
      var eventsSwiper = this.swiper;
      eventsSwiper.params.spaceBetween = 30;
      eventsSwiper.update();
    });
  }

  // For banner

  let checkBanner = document.querySelector("#portal-header #banner");
  let headerCustom = document.getElementById("portal-header");

  if (checkBanner != null) {
    headerCustom.classList.add("header-custom");
  }
});
