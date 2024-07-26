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
  var allSwiper = $("div.swiper");
  for (var i = 0; i < allSwiper.length; i++) {
    if (allSwiper[i].getAttribute("data-nb-results-by-batch") > 1) {
      allSwiper[i].swiper.params.spaceBetween = 30;
      allSwiper[i].swiper.update();
    }
  }

  // parralax
  const parallaxElements = document.querySelectorAll(
    ".banner-logo .swiper-image",
  );
  // The parallax function
  var parallax = (elements) => {
    elements.forEach((element) => {
      let yf = 800 - element.getBoundingClientRect().top;
      let y = yf - 600;
      if (y > 0) {
        // element.style.transform = 'translate3d(0, -' + (0.15 * y) + 'px ,0)'
        element.style.backgroundPosition = "0 -" + 0.1 * y + "px";
      }
    });
  };

  //If element is in viewport, set its position
  parallax(parallaxElements);

  //Call the function on scroll
  window.onscroll = () => {
    parallax(parallaxElements);
  };
});
