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

  // For banner

  let checkBanner = document.querySelector("#portal-header #banner");
  let headerCustom = document.getElementById("portal-header");

  if (checkBanner != null) {
    headerCustom.classList.add("header-custom");
  }

  //scroll

  const animatedElements = document.querySelectorAll(
    ".swiper-image, .home-citoyen-image-container, .a-la-une"
  );

  window.addEventListener("scroll", () => {
    animatedElements.forEach((img) => {
      const rect = img.getBoundingClientRect();
      const progress = Math.min(
        Math.max(1 - rect.top / window.innerHeight, 0),
        1
      );
      const translate = -70 * progress; // monte jusqu’à -10px
      const rotate = 30 * progress; // tourne jusqu’à 10deg
      img.style.setProperty("--triangle-translate", `${translate}px`);
      img.style.setProperty("--triangle-rotate", `${rotate}deg`);
    });
  });

  // // custom a la une wrapper

  // // Sélectionne tous les grids
  // const grids = document.querySelectorAll(
  //   ".a-la-une.home-dossiers .swiper-slide > a"
  // );

  // grids.forEach((grid) => {
  //   // Sélectionne tous les divs sauf le premier (l'image)
  //   const divs = Array.from(grid.children).slice(1);

  //   if (divs.length === 0) return; // rien à faire s'il n'y a pas de divs de texte

  //   // Crée le conteneur
  //   const wrapper = document.createElement("div");
  //   wrapper.classList.add("content");

  //   // Déplace les divs dans le conteneur
  //   divs.forEach((div) => wrapper.appendChild(div));

  //   // Ajoute le conteneur dans le grid
  //   grid.appendChild(wrapper);
  // });
});
