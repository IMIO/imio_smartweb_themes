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
    var newsSwiper = $(".sectionnews .swiper")[0].swiper;
    newsSwiper.params.spaceBetween = 30;
    (newsSwiper.params.speed = 1000), newsSwiper.update();
  }
  if ($(".sectionevents .swiper").length > 0) {
    var eventsSwiper = $(".sectionevents .swiper")[0].swiper;
    eventsSwiper.params.spaceBetween = 30;
    (eventsSwiper.params.speed = 1000), eventsSwiper.update();
  }

  // code placeholder

  var divExistante = document.querySelector(".swiper-wrapper");
  var nouvelleDiv = document.createElement("div");
  nouvelleDiv.classList.add("swiper-pagination");
  divExistante.insertAdjacentElement("afterend", nouvelleDiv);
  let swiper;
  const params = {
    pagination: {
      el: ".swiper-pagination",
      type: "bullets",
      clickable: true,
    },
    speed: 100,
    loop: true,
  };
  function initSwiper(params) {
    swiper = new Swiper(".smartweb_herobanner .swiper", params);
  }
  initSwiper(params);
});
