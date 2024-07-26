import "./scss/main.scss";
//
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

  // // animate
  // // Fonction pour déterminer si un élément est visible à l'écran
  // function isVisible(element, partial) {
  //     var viewTop = window.scrollY;
  //     var viewBottom = viewTop + window.innerHeight - 80;
  //     var top = element.offsetTop;
  //     var bottom = top + element.offsetHeight;
  //     var compareTop = partial ? bottom : top;
  //     var compareBottom = partial ? top : bottom;
  //     return compareBottom <= viewBottom && compareTop >= viewTop;
  // }

  // // Sélectionnez tous les éléments avec la classe "animate"
  // var animateElements = document.querySelectorAll('.quick-access li, .quick-access .section-title, .quick-access .rich_description, .swiper-image, .swiper_title, .swiper_description,.sectionnews .section-container, .sectionevents .section-container');

  // // Fonction pour ajouter la classe "play" aux éléments visibles
  // function addPlayClass() {
  //     animateElements.forEach(function (el) {
  //         if (isVisible(el, true)) {
  //             el.classList.add('play');
  //         }
  //     });
  // }

  // // Vérifiez l'état initial au chargement de la page
  // addPlayClass();

  // // Ajoutez un gestionnaire d'événement de défilement pour vérifier à nouveau au défilement
  // window.addEventListener('scroll', addPlayClass);

  // animation //
  (function ($) {
    $.fn.visible = function (partial) {
      var $t = $(this),
        $w = $(window),
        viewTop = $w.scrollTop(),
        viewBottom = viewTop + $w.height() - 80,
        _top = $t.offset().top,
        _bottom = _top + $t.height(),
        compareTop = partial === true ? _bottom : _top,
        compareBottom = partial === true ? _top : _bottom;
      return compareBottom <= viewBottom && compareTop >= viewTop;
    };
  })(jQuery);

  $(
    ".a-la-une,.sectionnews, .sectionevents, .quick-access, .home-annuaire",
  ).each(function (i, el) {
    var el = $(el);
    if (el.visible(true)) {
      el.addClass("play");
    }
  });

  $(window).scroll(function (event) {
    $(
      ".a-la-une,.sectionnews, .sectionevents, .quick-access, .home-annuaire",
    ).each(function (i, el) {
      var el = $(el);
      if (el.visible(true)) {
        el.addClass("play");
      }
    });
  });
});
